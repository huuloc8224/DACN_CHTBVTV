
const express = require('express');
const authController = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware'); // <--- CẦN DÒNG NÀY
const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// xem TẤT CẢ người dùng
router.get('/users', protect, admin, authController.getAllUsers);

//xem đơn hàng theo User ID
router.get('/users/:userId/orders', protect, admin, authController.getUserOrders);

module.exports = router;