import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const TOKEN_TYPE = Object.freeze({
  ACCESS: 'access',
  REFRESH: 'refresh',
});

function generateJti() {
  return crypto.randomBytes(16).toString('hex');
}

export function signAccessToken(payload) {
  return jwt.sign(
    { ...payload, type: TOKEN_TYPE.ACCESS, jti: generateJti() },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn }
  );
}

export function signRefreshToken(payload) {
  return jwt.sign(
    { ...payload, type: TOKEN_TYPE.REFRESH, jti: generateJti() },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiresIn }
  );
}

export function verifyAccessToken(token) {
  const decoded = jwt.verify(token, env.jwt.accessSecret);
  if (decoded.type !== TOKEN_TYPE.ACCESS) {
    throw new jwt.JsonWebTokenError('Invalid token type');
  }
  return decoded;
}

export function verifyRefreshToken(token) {
  const decoded = jwt.verify(token, env.jwt.refreshSecret);
  if (decoded.type !== TOKEN_TYPE.REFRESH) {
    throw new jwt.JsonWebTokenError('Invalid token type');
  }
  return decoded;
}
