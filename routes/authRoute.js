const express = require('express');
const authRoute = express.Router();
const authController = require('../controllers/authController');

authRoute.post('/signup', authController.signup);
authRoute.post('/verify-otp', authController.verifyOtp);
module.exports = authRoute