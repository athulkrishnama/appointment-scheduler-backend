const express = require('express');
const authRoute = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const {verifyToken} = require('../middlewares/auth');
const { verify } = require('jsonwebtoken');

authRoute.post('/signup',  upload.fields([
    {name:'logo', maxCount:1},
    {name:'document', maxCount:1}
]), authController.signup);
authRoute.post('/verify-otp', authController.verifyOtp);
authRoute.get('/resend-otp', authController.resendOtp);

authRoute.post('/login', authController.login);

authRoute.post('/google-signup', authController.googleSignup);

authRoute.get('/refresh-token', authController.refreshToken);

authRoute.post('/forgetPasswordOtp', authController.forgetPasswordOtp);
authRoute.get('/resendForgetPasswordOtp', authController.resendForgetPasswordOtp)
authRoute.post('/verifyForgetPasswordOtp', authController.verifyForgetPasswordOtp);
authRoute.patch('/resetPassword', authController.resetPassword);
authRoute.patch('/updatePassword',verifyToken, authController.updatePassword);
module.exports = authRoute