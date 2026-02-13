const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Register route   
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// User profile route (protected)
router.get('/profile', authMiddleware, authController.profile);

module.exports = router;