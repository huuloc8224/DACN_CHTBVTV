// backend/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { askChatbot } = require('../controllers/chatController');

// ĐÚNG ĐƯỜNG DẪN frontend đang gọi
router.post('/ask', askChatbot);

module.exports = router;