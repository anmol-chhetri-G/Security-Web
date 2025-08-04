import express from 'express';
import { signup, login, refreshToken, logout, logoutAllDevices, getUserSessions } from '../controllers/auth.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.post('/logout-all', authenticateToken, logoutAllDevices);
router.get('/sessions', authenticateToken, getUserSessions);

export default router;