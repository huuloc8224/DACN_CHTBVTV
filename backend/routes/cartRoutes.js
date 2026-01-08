const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const cartController = require('../controllers/cartController');

router.get('/', protect, cartController.getCart);
router.post('/', protect, cartController.addToCart);
router.patch('/:itemId', protect, cartController.updateCartItem);
router.delete('/:itemId', protect, cartController.removeCartItem);
router.delete('/', protect, cartController.clearCart);

module.exports = router;
