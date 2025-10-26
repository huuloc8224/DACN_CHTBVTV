// backend/routes/productRoutes.js
const express = require('express');
const productController = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware'); 
const router = express.Router();
// XÓA: const upload = require('../middleware/upload'); 

// 1. GET /api/products
router.get('/', productController.getAllProducts);

// 2. GET /api/products/:id
router.get('/:id', productController.getProductById); 

// 3. POST /api/products (Tạo - Dùng Base64 JSON)
router.post('/', protect, admin, productController.createProduct);

// 4. [MỚI] PUT /api/products/:id (Sửa - Dùng Base64 JSON)
router.put('/:id', protect, admin, productController.updateProduct);

// 5. [MỚI] DELETE /api/products/:id (Xóa sản phẩm)
router.delete('/:id', protect, admin, productController.deleteProduct);

module.exports = router;