// backend/routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware'); // <--- CẦN DÒNG NÀY
const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// [1] Admin xem TẤT CẢ người dùng (Dùng: /api/auth/users)
router.get('/users', protect, admin, authController.getAllUsers);

// [2] Admin xem đơn hàng theo User ID
router.get('/users/:userId/orders', protect, admin, authController.getUserOrders);

module.exports = router;