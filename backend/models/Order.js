// backend/models/Order.js
const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true }
});

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderDate: { type: Date, default: Date.now },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
    shippingAddress: { type: String, required: true },
    // TRƯỜNG MỚI
    phoneNumber: { type: String, required: true, maxlength: 15 }, 
    paymentMethod: { type: String, enum: ['COD', 'BankTransfer'], required: true },
    // END TRƯỜNG MỚI
    orderItems: [OrderItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);