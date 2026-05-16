import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../utils/jwt.js';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

function extractAccessToken(req) {
  const cookieToken = req.cookies?.[ACCESS_TOKEN_COOKIE];
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }
  return null;
}

export function requireAuth(req, res, next) {
  const token = extractAccessToken(req);
  if (!token) {
    return res.status(401).json({ message: '인증이 필요합니다.' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      user_type: decoded.user_type,
    };
    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: '토큰이 만료되었습니다.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
}

export function requireRole(...allowedRoles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }
    if (!allowedRoles.includes(req.user.user_type)) {
      return res.status(403).json({ message: '접근 권한이 없습니다.' });
    }
    return next();
  };
}
