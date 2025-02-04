const express = require("express");
const serviceProviderRoute = express.Router();
const serviceProviderController = require("../controllers/serviceProvider/serviceProviderController");
const ServiceRequestController = require("../controllers/serviceProvider/serviceRequests");
const appointmentController = require("../controllers/serviceProvider/appointmentController");
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
serviceProviderRoute.get('/getServiceRequest/:id', verifyToken, ServiceRequestController.getServiceRequest)
serviceProviderRoute.post('/createQuotation/:id', verifyToken, ServiceRequestController.createQuotation)
serviceProviderRoute.post('/textMessage/:id', verifyToken, ServiceRequestController.textMessage)
serviceProviderRoute.get('/getChat/:id', verifyToken, ServiceRequestController.getChat)
serviceProviderRoute.post('/acceptQuotation/:id', verifyToken, ServiceRequestController.acceptQuotation)

// appointments
serviceProviderRoute.get('/getAppointments', verifyToken, appointmentController.getAppointments)
serviceProviderRoute.get("/getCompletedAppointments", verifyToken, appointmentController.getCompletedAppointments);
serviceProviderRoute.patch('/cancelAppointment/:id', verifyToken, appointmentController.cancelAppointment)
serviceProviderRoute.patch('/markAsCompleted/:id', verifyToken, appointmentController.markAsCompleted)

module.exports = serviceProviderRoute