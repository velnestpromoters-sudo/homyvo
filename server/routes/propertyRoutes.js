const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const searchController = require('../controllers/searchController');
const { checkTenantAuth, protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');

router.get('/search', searchController.searchProperties);
router.get('/owner-analytics', protect, propertyController.getOwnerAnalytics); // Strictly restricted to Verified Owners mapping dynamic growth data natively
router.get('/:id', checkTenantAuth, propertyController.getProperty);
router.get('/', propertyController.getAllProperties); // general list
router.post('/:id/view', checkTenantAuth, propertyController.registerView); // Registers global traffic gracefully bypassing explicit blocks for guests

router.post(
  '/create',
  protect, // Ensure user exists
  upload.array('images', 5), // Max 5 images
  propertyController.createProperty
);

router.put(
  '/:id/availability',
  protect,
  propertyController.updateAvailability
);

router.patch(
  '/:id',
  protect,
  propertyController.updateProperty
);

router.delete(
  '/:id',
  protect,
  propertyController.deleteProperty
);

module.exports = router;
