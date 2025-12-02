
const express = require('express');
const productController = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware'); 
const router = express.Router();


router.get('/', productController.getAllProducts);


router.get('/:id', productController.getProductById); 

router.post('/', protect, admin, productController.createProduct);


router.put('/:id', protect, admin, productController.updateProduct);

router.delete('/:id', protect, admin, productController.deleteProduct);

module.exports = router;