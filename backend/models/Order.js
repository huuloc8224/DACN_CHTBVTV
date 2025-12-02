const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      image_url: { type: String },
      unitPrice: { type: Number, required: true },
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    }
  ],
  shippingAddress: { type: String, required: true },
  recipientName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  note: { type: String },
  paymentMethod: { type: String, required: true },
  itemsPrice: { type: Number, required: true },
  shippingPrice: { type: Number, required: true, default: 0 },
  taxPrice: { type: Number, required: true, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
