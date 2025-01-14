const express  = require('express')
const clientRoute = express.Router()
const {verifyToken} = require('../middlewares/auth')
const clientController = require('../controllers/clientController')
clientRoute.get('/getTopServices', clientController.getTopServices)

// getServices
clientRoute.get('/services', clientController.getServices);
clientRoute.get('/getFilterData', clientController.getFilterData);

// get single service
clientRoute.get('/service/:id', clientController.getService);

// get client details
clientRoute.get('/',verifyToken,clientController.getClientDetails)
module.exports = clientRoute