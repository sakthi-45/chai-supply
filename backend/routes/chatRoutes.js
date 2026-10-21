const express = require('express');
const router = express.Router();
const { handleChat } = require('../chatbot');

// POST /api/chat
router.post('/', handleChat);

module.exports = router;
