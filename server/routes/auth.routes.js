const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { signup, login, refresh, logout, getMe } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 5,
  message: { success: false, message: 'Too many attempts. Try again later.', code: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticateToken, getMe);

module.exports = router;
