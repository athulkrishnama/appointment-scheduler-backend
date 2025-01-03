const express = require('express');
const authRoute = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

authRoute.post('/signup',  upload.single('logo'), authController.signup);
authRoute.post('/verify-otp', authController.verifyOtp);
authRoute.get('/resend-otp', authController.resendOtp);

authRoute.post('/login', authController.login);

authRoute.post('/google-signup', authController.googleSignup);

authRoute.get('/refresh-token', authController.refreshToken);
module.exports = authRoute