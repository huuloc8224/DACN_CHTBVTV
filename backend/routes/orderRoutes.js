// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    getOrdersByUser,
    cancelOrder,
    getAllOrders, 
    updateOrderStatus, 
    deleteOrder,
    getOrderById,
    getOrderStats
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// === TUYẾN ĐƯỜNG CỦA USER ===
router.route('/myorders').get(protect, getOrdersByUser);
router.route('/cancel/:id').put(protect, cancelOrder);
router.route('/').post(protect, createOrder);


// === TUYẾN ĐƯỜNG CỦA ADMIN ===

// [MỚI] GET /api/orders/stats (Lấy thống kê)
// Phải đặt trước /:id
router.route('/stats').get(protect, admin, getOrderStats);

router.route('/').get(protect, admin, getAllOrders); 
router.put('/:id/status', protect, admin, updateOrderStatus);
router.delete('/:id', protect, admin, deleteOrder);

// === TUYẾN ĐƯỜNG CHUNG ===
router.route('/:id').get(protect, getOrderById);

module.exports = router;