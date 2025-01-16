const express  = require('express')
const clientRoute = express.Router()
const {verifyToken} = require('../middlewares/auth')
const clientController = require('../controllers/client/clientController')
const serviceRequestController = require('../controllers/client/serviceRequestController')
const addressController = require('../controllers/client/addressController')
clientRoute.get('/getTopServices', clientController.getTopServices)

// getServices
clientRoute.get('/services', clientController.getServices);
clientRoute.get('/getFilterData', clientController.getFilterData);

// get single service
clientRoute.get('/service/:id', clientController.getService);

// get client details
clientRoute.get('/',verifyToken,clientController.getClientDetails)


// service Request Route
clientRoute.post('/serviceRequest',verifyToken,serviceRequestController.serviceRequest)

// address Route
clientRoute.post('/addAddress',verifyToken,addressController.addAddress)
clientRoute.get('/getAddresses',verifyToken,addressController.getAddresses)
clientRoute.put('/editAddress',verifyToken,addressController.editAddress)
module.exports = clientRoute