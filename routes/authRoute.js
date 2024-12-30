const express = require('express');
const authRoute = express.Router();
const authController = require('../controllers/authController');

authRoute.post('/signup', authController.signup);
authRoute.post('/verify-otp', authController.verifyOtp);
authRoute.get('/resend-otp', authController.resendOtp);

authRoute.post('/login', authController.login);

authRoute.post('/google-signup', authController.googleSignup);
module.exports = authRoute