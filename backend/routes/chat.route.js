const express = require('express');
const router = express.Router();
const {
  chatController,
  getChatHistory
} = require('../controllers/chatController');

router.post('/ask', chatController);
router.get('/history', getChatHistory);

module.exports = router;
