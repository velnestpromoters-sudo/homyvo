const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { checkTenantAuth } = require('../middleware/authMiddleware');

router.get('/:id', checkTenantAuth, propertyController.getProperty);
router.get('/', propertyController.getAllProperties); // general list

module.exports = router;
