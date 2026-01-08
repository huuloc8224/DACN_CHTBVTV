// backend/models/KnowledgeBase.js
const mongoose = require('mongoose');

const knowledgeSchema = new mongoose.Schema({
  diseaseName: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  }, // Tên bệnh (ví dụ: "Bệnh đạo ôn lá lúa")

  symptoms: [{ 
    type: String, 
    required: true 
  }], // Danh sách triệu chứng (mảng string)

  activeIngredients: [{ 
    type: String, 
    required: true 
  }], // Danh sách hoạt chất cần dùng (mảng string)

  description: String, // Mô tả ngắn về bệnh (tùy chọn)

  prevention: String, // Cách phòng ngừa

  treatmentGuide: String, // Hướng dẫn xử lý chi tiết

  recommendedProducts: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }], // Sản phẩm gợi ý (populate từ collection Product)

  createdAt: { 
    type: Date, 
    default: Date.now 
  },

  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Cập nhật updatedAt khi save
knowledgeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('KnowledgeBase', knowledgeSchema);