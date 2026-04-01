const express = require('express');
const router = require('express').Router();
const authController = require('../controllers/authController');

// POST /auth/send-otp - Dispatch emails via Nodemailer
router.post('/send-otp', authController.sendOTP);

// POST /auth/verify-otp - Compare store and generate JWT
router.post('/verify-otp', authController.verifyOTPAndLogin);

module.exports = router;
