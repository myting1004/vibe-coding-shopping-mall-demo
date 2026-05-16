import { Router } from 'express';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

router.get('/', requireAuth, requireRole('admin'), listUsers);
router.post('/', requireAuth, requireRole('admin'), createUser);
router.get('/:id', requireAuth, getUser);
router.patch('/:id', requireAuth, updateUser);
router.delete('/:id', requireAuth, requireRole('admin'), deleteUser);

export default router;
