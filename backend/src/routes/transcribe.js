import { Router } from 'express';
import { generateEphemeralToken } from '../controllers/transcribeController.js';

const router = Router();

// Endpoint to generate ephemeral token
router.post('/token', generateEphemeralToken);

export default router; 