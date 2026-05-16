import crypto from 'node:crypto';

export function generateRawToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

export function hashRawToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}
