import { Router } from 'express';
import productRoutes from './productRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

router.use('/products', productRoutes);
router.use('/users', userRoutes);

export default router;
