const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    active_ingredient: { type: String },
    stock_quantity: { type: Number, required: true, default: 0 },
    image_url: { type: String, default: '/images/placeholder.jpg' }, 
    
    // [THÊM LẠI] Trường phân loại sản phẩm
    category: { 
        type: String, 
        enum: ['thuoc', 'phan', 'thucan'], // Các giá trị cho phép
        required: true, // Bắt buộc phải có
        default: 'thuoc'
    },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;