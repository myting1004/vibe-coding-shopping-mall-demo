import { env } from '../config/env.js';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '../middlewares/auth.js';

function parseExpiresMs(spec) {
  if (typeof spec === 'number') return spec * 1000;
  const match = /^(\d+)([smhd])$/.exec(String(spec).trim());
  if (!match) return 0;
  const value = Number(match[1]);
  const unit = match[2];
  const unitMs = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
  return value * unitMs;
}

const ACCESS_MAX_AGE = parseExpiresMs(env.jwt.accessExpiresIn);
const REFRESH_MAX_AGE = parseExpiresMs(env.jwt.refreshExpiresIn);

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    path: '/',
  };
}

export function setAccessCookie(res, token) {
  res.cookie(ACCESS_TOKEN_COOKIE, token, {
    ...baseCookieOptions(),
    maxAge: ACCESS_MAX_AGE,
  });
}

export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_TOKEN_COOKIE, token, {
    ...baseCookieOptions(),
    maxAge: REFRESH_MAX_AGE,
    path: '/api/auth',
  });
}

export function clearAuthCookies(res) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { ...baseCookieOptions() });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { ...baseCookieOptions(), path: '/api/auth' });
}

export { ACCESS_MAX_AGE, REFRESH_MAX_AGE };
