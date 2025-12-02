
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

router.get('/addresses', protect, userController.getUserAddresses);

//Thêm địa chỉ mới
router.post('/addresses', protect, userController.addAddress);

module.exports = router;