// backend/models/KnowledgeBase.js
const mongoose = require('mongoose');

const KnowledgeBaseSchema = new mongoose.Schema({
    topic: { type: String, required: true },
    crop: { type: String },
    symptoms: [{ type: String, required: true }], // <-- đây
    severity: { type: String },
    treatment_recommendations: { type: String, required: true }
});

module.exports = mongoose.model('KnowledgeBase', KnowledgeBaseSchema);
