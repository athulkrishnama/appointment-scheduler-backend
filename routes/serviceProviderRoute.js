const express = require("express");
const serviceProviderRoute = express.Router();
const serviceProviderController = require("../controllers/serviceProvider/serviceProviderController");
const ServiceRequestController = require("../controllers/serviceProvider/serviceRequests");
const {verifyToken} = require("../middlewares/auth")
const multer = require('multer');
const serviceRequests = require("../models/serviceRequests");
const upload = multer({ storage: multer.memoryStorage() });

// serviceProviderRoute.get("/service-providers",verifyToken, serviceProviderController.getServiceProvider);
// serviceProviderRoute.patch("/updateServiceProviderStatus/:id",verifyToken, serviceProviderController.updateServiceProviderStatus);

// service management
serviceProviderRoute.post("/addService", verifyToken, upload.single('image'),serviceProviderController.addService);
serviceProviderRoute.get("/services",verifyToken, serviceProviderController.getServices);
serviceProviderRoute.patch("/updateServiceStatus/:id", verifyToken, serviceProviderController.updateServiceStatus);
serviceProviderRoute.put("/updateService/:id", verifyToken, upload.single('image'), serviceProviderController.updateService);

// profile management
serviceProviderRoute.get('/getServiceProviderDetails', verifyToken, serviceProviderController.getServiceProviderDetails)
serviceProviderRoute.patch('/updateLogo', verifyToken, upload.single('logo'), serviceProviderController.updateLogo)
serviceProviderRoute.put('/updateServiceProviderDetails', verifyToken, serviceProviderController.updateServiceProviderDetails)

// service requests
serviceProviderRoute.get('/getServiceRequests', verifyToken, ServiceRequestController.getServiceRequests)
module.exports = serviceProviderRoute