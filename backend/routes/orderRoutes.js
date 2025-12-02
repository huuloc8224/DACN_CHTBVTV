// routes/orderRoutes.js
const express = require('express');
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getSalesStatistics,
  getTopCustomers,
  getTopProducts,
  cancelOrder
} = require('../controllers/orderController');

const { protect, admin } = require('../middleware/authMiddleware');

// USER
router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.put('/cancel/:id', protect, cancelOrder);

// ADMIN
router.get('/admin', protect, admin, getAllOrders);
router.put('/admin/:id/status', protect, admin, updateOrderStatus);
router.delete('/admin/:id', protect, admin, deleteOrder);

// ADMIN STATS
router.get('/admin/stats/sales', protect, admin, getSalesStatistics);
router.get('/admin/stats/top-customers', protect, admin, getTopCustomers);
router.get('/admin/stats/top-products', protect, admin, getTopProducts);
router.put('/cancel/:id', protect, admin, cancelOrder);

// ORDER DETAIL (last)
router.get('/:id', protect, getOrderById);

module.exports = router;
