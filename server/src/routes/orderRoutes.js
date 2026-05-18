import { Router } from 'express';
import {
  createOrder,
  listOrders,
  getOrder,
  cancelOrder,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

// 모든 주문 엔드포인트는 인증 필수 (본인 주문만 조회·관리).
router.use(requireAuth);

router.post('/', createOrder);
router.get('/', listOrders);
router.get('/:id', getOrder);
router.post('/:id/cancel', cancelOrder);

// 관리자만 상태 직접 변경 가능 (preparing → shipped → delivered 등).
router.patch('/:id/status', requireRole('admin'), updateOrderStatus);

export default router;
