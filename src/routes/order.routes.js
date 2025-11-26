const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  trackOrder,
} = require('../controllers/order.controllers');
const { authUserMiddleware } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authUserMiddleware);

// Create new order
router.post('/', createOrder);

// Get user's orders
router.get('/', getUserOrders);

// Get single order by ID
router.get('/:orderId', getOrderById);

// Cancel order
router.put('/:orderId/cancel', cancelOrder);

// Track order
router.get('/:orderId/track', trackOrder);

module.exports = router;
