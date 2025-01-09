const express  = require('express')
const clientRoute = express.Router()
const clientController = require('../controllers/clientController')
clientRoute.get('/getTopServices', clientController.getTopServices)

// getServices
clientRoute.get('/services', clientController.getServices);
clientRoute.get('/getFilterData', clientController.getFilterData);

module.exports = clientRoute