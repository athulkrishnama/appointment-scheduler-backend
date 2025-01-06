const express = require("express");
const adminRoute = express.Router();
const adminController = require("../controllers/adminController");
const {verifyToken} = require("../middlewares/auth")
// serviece provider requests
adminRoute.get("/serviceProviderRequests", verifyToken, adminController.serviceProviderRequests);
adminRoute.patch("/updateRequestStatus", verifyToken, adminController.updateRequestStatus);

// client management
adminRoute.get("/clients", verifyToken, adminController.getClients);
adminRoute.patch("/updateClientStatus/:id", verifyToken, adminController.updateClientStatus);

// service provider management
adminRoute.get("/service-providers",verifyToken, adminController.getServiceProvider);
adminRoute.patch("/updateServiceProviderStatus/:id", verifyToken, adminController.updateServiceProviderStatus);
module.exports = adminRoute