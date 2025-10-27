// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// [MỚI] Lấy tất cả địa chỉ của user đang đăng nhập
// GET /api/users/addresses
router.get('/addresses', protect, userController.getUserAddresses);

// [MỚI] Thêm địa chỉ mới
// POST /api/users/addresses
router.post('/addresses', protect, userController.addAddress);

// (Bạn có thể thêm Xóa/Sửa địa chỉ ở đây nếu cần)

module.exports = router;