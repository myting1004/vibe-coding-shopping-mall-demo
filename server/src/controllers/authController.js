import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import {
  setAccessCookie,
  setRefreshCookie,
  clearAuthCookies,
  REFRESH_MAX_AGE,
} from '../utils/cookies.js';
import { REFRESH_TOKEN_COOKIE } from '../middlewares/auth.js';
import { validatePasswordStrength } from '../utils/password.js';
import { generateRawToken, hashRawToken } from '../utils/tokens.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../services/mailTemplates.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVALID_CREDENTIALS_MESSAGE = '이메일 또는 비밀번호가 올바르지 않습니다.';
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000;
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;

function publicUser(user) {
  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    user_type: user.user_type,
    address: user.address,
    emailVerified: user.emailVerified ?? false,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function tokenPayloadFor(user) {
  return {
    sub: user._id.toString(),
    email: user.email,
    user_type: user.user_type,
  };
}

async function issueTokensAndPersist(user, req, res) {
  const accessToken = signAccessToken(tokenPayloadFor(user));
  const refreshToken = signRefreshToken({ sub: user._id.toString() });

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_MAX_AGE),
    userAgent: req.headers['user-agent'] ?? '',
    ip: req.ip,
  });

  setAccessCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);

  return { accessToken, refreshToken };
}

export async function register(req, res, next) {
  try {
    const { email, name, password, address } = req.body;

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ message: '이메일 형식이 올바르지 않습니다.' });
    }
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: '이름을 입력해주세요.' });
    }
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });
    }

    const user = await User.create({
      email: normalizedEmail,
      name: name.trim(),
      password,
      address,
    });

    await issueVerificationEmail(user).catch((err) => {
      console.error('[auth] failed to send verification email:', err.message);
    });
    await issueTokensAndPersist(user, req, res);

    return res.status(201).json({ data: publicUser(user) });
  } catch (err) {
    return next(err);
  }
}

async function issueVerificationEmail(user) {
  const rawToken = generateRawToken();
  user.emailVerificationTokenHash = hashRawToken(rawToken);
  user.emailVerificationExpiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);
  await user.save();

  return sendVerificationEmail({ to: user.email, name: user.name, token: rawToken });
}

export async function requestEmailVerification(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }
    if (user.emailVerified) {
      return res.status(400).json({ message: '이미 인증된 이메일입니다.' });
    }
    await issueVerificationEmail(user);
    return res.json({ message: '인증 메일을 발송했습니다.' });
  } catch (err) {
    return next(err);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: '토큰이 필요합니다.' });
    }

    const tokenHash = hashRawToken(token);
    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: '유효하지 않거나 만료된 인증 링크입니다.' });
    }

    user.emailVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpiresAt = null;
    await user.save();

    return res.json({ data: publicUser(user) });
  } catch (err) {
    return next(err);
  }
}

export async function requestPasswordReset(req, res, next) {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: '이메일을 입력해주세요.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    // 사용자 존재 여부는 노출하지 않는다
    if (user) {
      const rawToken = generateRawToken();
      user.passwordResetTokenHash = hashRawToken(rawToken);
      user.passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
      await user.save();
      try {
        await sendPasswordResetEmail({
          to: user.email,
          name: user.name,
          token: rawToken,
        });
      } catch (err) {
        console.error('[auth] failed to send reset email:', err.message);
      }
    }

    return res.json({
      message: '입력하신 이메일이 등록되어 있다면 재설정 메일을 발송했습니다.',
    });
  } catch (err) {
    return next(err);
  }
}

export async function confirmPasswordReset(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: '토큰이 필요합니다.' });
    }
    const strengthError = validatePasswordStrength(newPassword);
    if (strengthError) {
      return res.status(400).json({ message: strengthError });
    }

    const tokenHash = hashRawToken(token);
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: '유효하지 않거나 만료된 재설정 링크입니다.' });
    }

    user.password = newPassword;
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await user.save();

    await RefreshToken.updateMany(
      { user: user._id, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
    clearAuthCookies(res);

    return res.json({ message: '비밀번호가 재설정되었습니다. 다시 로그인해주세요.' });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (
      !email ||
      typeof email !== 'string' ||
      !password ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({ message: INVALID_CREDENTIALS_MESSAGE });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: INVALID_CREDENTIALS_MESSAGE });
    }

    if (user.isLocked()) {
      const remainMs = user.lockedUntil.getTime() - Date.now();
      const remainMin = Math.ceil(remainMs / 60_000);
      return res.status(423).json({
        message: `계정이 잠겼습니다. ${remainMin}분 후 다시 시도해주세요.`,
        code: 'ACCOUNT_LOCKED',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts ?? 0) + 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
        user.failedLoginAttempts = 0;
        await user.save();
        return res.status(423).json({
          message: '로그인 5회 실패로 계정이 30분간 잠겼습니다.',
          code: 'ACCOUNT_LOCKED',
        });
      }
      await user.save();
      return res.status(401).json({ message: INVALID_CREDENTIALS_MESSAGE });
    }

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
    }
    user.lastLoginAt = new Date();
    await user.save();

    await issueTokensAndPersist(user, req, res);

    return res.json({ data: publicUser(user) });
  } catch (err) {
    return next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await RefreshToken.updateOne(
        { tokenHash, revokedAt: null },
        { $set: { revokedAt: new Date() } }
      );
    }
    clearAuthCookies(res);
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      return res.status(401).json({ message: '리프레시 토큰이 없습니다.' });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      clearAuthCookies(res);
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: '리프레시 토큰이 만료되었습니다.' });
      }
      return res.status(401).json({ message: '유효하지 않은 리프레시 토큰입니다.' });
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await RefreshToken.findOne({ tokenHash });

    if (!stored) {
      clearAuthCookies(res);
      return res.status(401).json({ message: '유효하지 않은 리프레시 토큰입니다.' });
    }

    if (!stored.isActive()) {
      // 이미 폐기된 토큰이 다시 들어옴 → 탈취 의심, 같은 사용자의 모든 토큰 무효화
      await RefreshToken.updateMany(
        { user: stored.user, revokedAt: null },
        { $set: { revokedAt: new Date() } }
      );
      clearAuthCookies(res);
      return res.status(401).json({
        message: '리프레시 토큰이 재사용되어 모든 세션이 종료되었습니다. 다시 로그인해주세요.',
      });
    }

    const user = await User.findById(decoded.sub);
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const newAccessToken = signAccessToken(tokenPayloadFor(user));
    const newRefreshToken = signRefreshToken({ sub: user._id.toString() });
    const newHash = hashToken(newRefreshToken);

    stored.revokedAt = new Date();
    stored.replacedByHash = newHash;
    await stored.save();

    await RefreshToken.create({
      user: user._id,
      tokenHash: newHash,
      expiresAt: new Date(Date.now() + REFRESH_MAX_AGE),
      userAgent: req.headers['user-agent'] ?? '',
      ip: req.ip,
    });

    setAccessCookie(res, newAccessToken);
    setRefreshCookie(res, newRefreshToken);

    return res.json({ data: publicUser(user) });
  } catch (err) {
    return next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }
    return res.json({ data: publicUser(user) });
  } catch (err) {
    return next(err);
  }
}

export const __testing = { hashToken };
