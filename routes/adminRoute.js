const express = require("express");
const adminRoute = express.Router();
const adminController = require("../controllers/adminController");
const categoryController = require("../controllers/categoryController");
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

// category management
adminRoute.get("/categories", verifyToken, categoryController.getCategories);
adminRoute.post("/addCategory", verifyToken, categoryController.addCategory);
adminRoute.patch("/updateCategoryStatus/:id", verifyToken, categoryController.updateCategoryStatus);
// adminRoute.delete("/deleteCategory/:id", verifyToken, adminController.deleteCategory);
adminRoute.put("/updateCategory/:id", verifyToken, categoryController.updateCategory);

module.exports = adminRoute