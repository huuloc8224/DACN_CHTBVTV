const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'bot'], required: true },
    text: { type: String, required: true },
    source: String
  },
  { _id: false }
);

const chatSessionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    title: String,
    disease: String,

    messages: [messageSchema],

    suggestedProducts: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatSession', chatSessionSchema);
