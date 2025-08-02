import express from 'express';
import { submitFeedback, getFeedbackStats } from '../controllers/feedback.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Submit feedback (optional authentication)
router.post('/submit', submitFeedback);

// Get feedback statistics (requires authentication)
router.get('/stats', authenticateToken, getFeedbackStats);

export default router; 