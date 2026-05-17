import { Router } from 'express';
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cartController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// 모든 장바구니 엔드포인트는 인증 필수 (사용자별 장바구니).
router.use(requireAuth);

router.get('/', getCart);
router.delete('/', clearCart);

router.post('/items', addCartItem);
router.patch('/items/:productId', updateCartItem);
router.delete('/items/:productId', removeCartItem);

export default router;
