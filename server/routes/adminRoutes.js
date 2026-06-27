const express = require('express');
const router = express.Router();
const { loginAdmin, getDashboardStats, getDatabaseStats, getCollectionData } = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);
router.get('/stats', protectAdmin, getDashboardStats);
router.get('/db-stats', protectAdmin, getDatabaseStats);
router.get('/db-collection/:name', protectAdmin, getCollectionData);

module.exports = router;
