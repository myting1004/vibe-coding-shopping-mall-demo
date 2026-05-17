import { Router } from 'express';
import productRoutes from './productRoutes.js';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';
import cartRoutes from './cartRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/cart', cartRoutes);

export default router;
