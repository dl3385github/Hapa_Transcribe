import { Router } from 'express';
import transcribeRoutes from './transcribe.js';

const router = Router();

// Mount route groups
router.use('/transcribe', transcribeRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router; 