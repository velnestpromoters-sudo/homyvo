const express = require('express');
const router = express.Router();
const { trackPageTime, getPageTimeAnalytics, getSearchConsoleStats } = require('../controllers/analyticsController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public tracking endpoint (accessible by website visitors)
router.post('/track-time', trackPageTime);

// Admin dashboard analytical metrics
router.get('/page-times', protectAdmin, getPageTimeAnalytics);
router.get('/search-console', protectAdmin, getSearchConsoleStats);

module.exports = router;
