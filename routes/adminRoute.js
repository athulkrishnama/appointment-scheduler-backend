const express = require("express");
const adminRoute = express.Router();
const adminController = require("../controllers/adminController");

adminRoute.get("/serviceProviderRequests", adminController.serviceProviderRequests);
adminRoute.patch("/updateRequestStatus", adminController.updateRequestStatus);
module.exports = adminRoute