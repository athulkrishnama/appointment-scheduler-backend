const express = require("express");
const serviceProviderRoute = express.Router();
const serviceProviderController = require("../controllers/serviceProviderController");
const {verifyToken} = require("../middlewares/auth")
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// serviceProviderRoute.get("/service-providers",verifyToken, serviceProviderController.getServiceProvider);
// serviceProviderRoute.patch("/updateServiceProviderStatus/:id",verifyToken, serviceProviderController.updateServiceProviderStatus);

// service management
serviceProviderRoute.post("/addService", verifyToken, upload.single('image'),serviceProviderController.addService);
serviceProviderRoute.get("/services",verifyToken, serviceProviderController.getServices);
serviceProviderRoute.patch("/updateServiceStatus/:id", verifyToken, serviceProviderController.updateServiceStatus);
serviceProviderRoute.put("/updateService/:id", verifyToken, upload.single('image'), serviceProviderController.updateService);

module.exports = serviceProviderRoute