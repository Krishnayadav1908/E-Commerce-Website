const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controller/authController');
const authMiddleware = require('../middleware/authMiddleware');

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 20,
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: 'Too many requests. Please try again later.' }
});

router.use(['/register', '/login', '/verify-otp', '/resend-otp'], authLimiter);

// Register route   
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Verify email OTP
router.post('/verify-otp', authController.verifyOtp);

// Resend email OTP
router.post('/resend-otp', authController.resendOtp);

// User profile route (protected)
router.get('/profile', authMiddleware, authController.profile);

// Update profile route (protected)
router.put('/profile', authMiddleware, authController.updateProfile);

// Change password route (protected)
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;