// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// PROFILE
router.get('/profile', protect, userController.getProfile);
router.patch('/profile', protect, userController.updateProfile);

// ADDRESSES
router.get('/addresses', protect, userController.getAddresses);
router.post('/addresses', protect, userController.addAddress);

// Sửa
router.patch('/addresses/:id', protect, userController.updateAddress);

// Xóa địa chỉ
router.delete('/addresses/:id', protect, userController.deleteAddress);

// Đặt mặc định
router.patch('/addresses/:id/default', protect, userController.setDefaultAddress);

module.exports = router;
