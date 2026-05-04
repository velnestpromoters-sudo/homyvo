const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-listing', paymentController.createListingOrder);
router.post('/verify-listing', paymentController.verifyListingPayment);

router.post('/create-access', paymentController.createAccessOrder);
router.post('/verify-access', paymentController.verifyAccessPayment);

module.exports = router;
