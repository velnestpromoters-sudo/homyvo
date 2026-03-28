const express = require('express');
const router = require('express').Router();
const authController = require('../controllers/authController');

// POST /auth/login - Role-based login/signup flow
router.post('/login', authController.login);

module.exports = router;
