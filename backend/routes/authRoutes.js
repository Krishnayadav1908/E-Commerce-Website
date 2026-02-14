const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const authMiddleware = require('../middleware/authMiddleware');

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