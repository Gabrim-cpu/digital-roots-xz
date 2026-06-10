import express from 'express';
import { handleBackendSession } from '../controllers/authController.js';

const router = express.Router();

// Endpoint: http://localhost:5000/api/auth/session-verify
router.post('/session-verify', handleBackendSession);

export default router;