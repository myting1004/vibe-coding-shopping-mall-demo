import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
    code: 'RATE_LIMITED',
  },
});

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    message: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
    code: 'RATE_LIMITED',
  },
});
