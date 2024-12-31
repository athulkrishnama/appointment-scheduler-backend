const express  = require('express')
const clientRoute = express.Router()
const clientController = require('../controllers/clientController')
clientRoute.get('/getTopServices', clientController.getTopServices)

module.exports = clientRoute