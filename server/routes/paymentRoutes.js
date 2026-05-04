const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-listing-payment', paymentController.createListingOrder);
router.post('/create-unlock-payment', paymentController.createAccessOrder);
router.post('/verify', paymentController.verifyPayment);

module.exports = router;
