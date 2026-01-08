// routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// Lấy thông tin user hiện tại
router.get('/me', protect, authController.getCurrentUser);

// Quên mật khẩu: gửi email chứa token reset
router.post('/forgot', authController.forgotPassword);

// Đặt lại mật khẩu bằng token
router.post('/reset/:token', authController.resetPassword);

// Đổi mật khẩu cho user đã xác thực
router.post('/change-password', protect, authController.changePassword);

// Admin: xem TẤT CẢ người dùng
router.get('/users', protect, admin, authController.getAllUsers);

// Admin: xem đơn hàng theo User ID
router.get('/users/:userId/orders', protect, admin, authController.getUserOrders);

module.exports = router;
