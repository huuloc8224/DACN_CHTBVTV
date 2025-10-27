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
    // [MỚI] Import các hàm thống kê
    getSalesStatistics,
    getTopCustomers,
    getOrdersByUserId
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// === TUYẾN ĐƯỜNG CỦA USER ===
router.route('/myorders').get(protect, getOrdersByUser);
router.route('/cancel/:id').put(protect, cancelOrder);
router.route('/').post(protect, createOrder);

// === TUYẾN ĐƯỜNG CỦA ADMIN ===

// [MỚI] THỐNG KÊ (Phải đặt trước /:id)
router.route('/stats/sales').get(protect, admin, getSalesStatistics);
router.route('/stats/top-customers').get(protect, admin, getTopCustomers);
router.route('/user/:userId').get(protect, admin, getOrdersByUserId); // Lấy đơn hàng của 1 user

// Quản lý Đơn hàng
router.route('/').get(protect, admin, getAllOrders); 
router.put('/:id/status', protect, admin, updateOrderStatus);
router.delete('/:id', protect, admin, deleteOrder);

// === TUYẾN ĐƯỜNG CHUNG ===
router.route('/:id').get(protect, getOrderById);

module.exports = router;