const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.post('/apply', protect, requestController.applyForProperty);

module.exports = router;
