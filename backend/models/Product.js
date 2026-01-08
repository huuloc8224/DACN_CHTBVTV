const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },

    description: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true,
      default: 0
    },

    // HOẠT CHẤT (PHẢI LÀ MẢNG)
    activeIngredients: {
      type: [String],
      default: []
    },

    stock_quantity: {
      type: Number,
      required: true,
      default: 0
    },

    image_url: {
      type: String,
      default: '/images/placeholder.jpg'
    },

    category: {
      type: String,
      enum: ['thuoc', 'phan', 'thucan'],
      required: true,
      default: 'thuoc'
    },

    // BỆNH ĐẶC TRỊ / PHÒNG
    treats: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
