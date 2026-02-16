const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Create order (user must be authenticated)
router.post('/create', authMiddleware, orderController.createOrder);

// Get all orders for a user
router.get('/user/:userId', authMiddleware, orderController.getUserOrders);

// Download order invoice as PDF
router.get('/:orderId/invoice', authMiddleware, orderController.downloadInvoice);

module.exports = router;
