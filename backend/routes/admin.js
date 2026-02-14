const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(authMiddleware, adminMiddleware);

router.get('/stats', adminController.getStats);
router.get('/orders', adminController.getOrders);
router.patch('/orders/:orderId/status', adminController.updateOrderStatus);
router.patch('/orders/:orderId/payment', adminController.updatePaymentStatus);
router.get('/users', adminController.getUsers);
router.patch('/users/:userId/role', adminController.updateUserRole);
router.get('/products', adminController.getProducts);
router.get('/products/low-stock', adminController.getLowStockProducts);
router.post('/products', adminController.createProduct);
router.patch('/products/:productId', adminController.updateProduct);
router.delete('/products/:productId', adminController.deleteProduct);
router.get('/audit', adminController.getAuditLogs);
router.get('/email-logs', adminController.getEmailLogs);
router.post('/email-logs/:logId/retry', adminController.retryEmail);
router.get('/analytics/summary', adminController.getAnalyticsSummary);
router.get('/analytics/revenue-trend', adminController.getRevenueTrend);
router.get('/analytics/top-products', adminController.getTopProducts);
router.get('/analytics/category-breakdown', adminController.getCategoryBreakdown);

module.exports = router;
