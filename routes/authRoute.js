const express = require('express');
const authRoute = express.Router();
const authController = require('../controllers/authController');

authRoute.post('/signup', authController.signup);
module.exports = authRoute