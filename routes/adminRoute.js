const express = require("express");
const adminRoute = express.Router();
const adminController = require("../controllers/adminController");

// serviece provider requests
adminRoute.get("/serviceProviderRequests", adminController.serviceProviderRequests);
adminRoute.patch("/updateRequestStatus", adminController.updateRequestStatus);

// client management
adminRoute.get("/clients", adminController.getClients);
adminRoute.patch("/updateClientStatus/:id", adminController.updateClientStatus);
module.exports = adminRoute