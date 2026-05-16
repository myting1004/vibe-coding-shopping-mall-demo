import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { authRateLimiter, loginRateLimiter } from '../middlewares/rateLimit.js';
import {
  register,
  login,
  logout,
  me,
  refresh,
  requestEmailVerification,
  verifyEmail,
  requestPasswordReset,
  confirmPasswordReset,
} from '../controllers/authController.js';

const router = Router();

router.post('/register', authRateLimiter, register);
router.post('/login', loginRateLimiter, login);
router.post('/logout', logout);
router.post('/refresh', authRateLimiter, refresh);
router.get('/me', requireAuth, me);

router.post('/email/verify-request', authRateLimiter, requireAuth, requestEmailVerification);
router.post('/email/verify', authRateLimiter, verifyEmail);

router.post('/password-reset/request', authRateLimiter, requestPasswordReset);
router.post('/password-reset/confirm', authRateLimiter, confirmPasswordReset);

export default router;
