const express = require('express');
const router = require('express').Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /auth/send-otp - Dispatch emails via Nodemailer
router.post('/send-otp', authController.sendOTP);

// POST /auth/verify-otp - Compare store and generate JWT
router.post('/verify-otp', authController.verifyOTPAndLogin);

// POST /auth/login - Permanent password bypass
router.post('/login', authController.loginWithPassword);

// PUT /auth/profile - Edit profile details
router.put('/profile', protect, authController.updateProfile);

module.exports = router;
