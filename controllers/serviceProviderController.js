const Service = require("../models/services");
const User = require("../models/user");
const {uploadBanner} = require("../helpers/imageUploader")


const addService = async (req, res) => {
    try {
        const { serviceName, serviceDescription, category, additionalDetails } = req.body;
        const existingService = await Service.findOne({ serviceName });
        if (existingService) {
            return res.status(400).json({success: false, message: "Service already exists" });
        }
        const image = req.file?.buffer;
        const imagelink = await uploadBanner(image);
        console.log(imagelink)
        const service = new Service({
            serviceName,
            serviceDescription,
            category,
            additionalDetails:JSON.parse(additionalDetails), // Parse the additionalDetails,
            image:imagelink,
            serviceProvider: req.userId
        });


        await service.save();
        await User.findByIdAndUpdate(req.userId, { $push: { "serviceDetails.servicesOffered": service._id } });
        res.status(201).json({success: true, message: "Service added successfully", service });
    } catch (error) {
        console.error("Error adding service:", error);
        res.status(500).json({success: false, message: "Failed to add service" });
    }
};

const getServices = async (req, res) => {
    try {
        console.log("reqid", req.userId)
        const curPage = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const services = await Service.find({ serviceProvider: req.userId }).sort({ createdAt: -1 }).skip((curPage - 1) * limit).limit(limit);
        const totalPage = Math.ceil(await Service.countDocuments({ serviceProvider: req.userId }) / limit);
        res.status(200).json({success: true, services, totalPage, curPage});
    } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({success: false, message: "Failed to fetch services" });
    }
};

const updateServiceStatus = async (req, res) => {
    try {
        console.log(req.params.id)
        const {action }= req.body
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({success: false, message: "Service not found" });
        }
        service.isActive = action === "unlist" ? false : true;
        await service.save();
        res.status(200).json({success: true, message: "Service status updated successfully" });
    } catch (error) {
        console.error("Error updating service status:", error);
        res.status(500).json({success: false, message: "Failed to update service status" });
    }
}

const updateService = async (req, res) => {
    try {
        const {id} = req.params;
        const updatedService = req.body;
        updatedService.additionalDetails = JSON.parse(updatedService.additionalDetails);
        const service = await Service.findById(id);
        if (!service) {
            return res.status(404).json({success: false, message: "Service not found" });
        }
        if(req.file?.buffer){
            const imagelink = await uploadBanner(req.file.buffer);
            updatedService.image = imagelink;
        }
        const response = await Service.findByIdAndUpdate(id, updatedService, { new: true });
        if (!response) {
            return res.status(404).json({success: false, message: "Service not found" });
        }
        return res.status(200).json({success: true, message: "Service updated successfully", updatedData:response });
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: "Server Error" });
    }
};
module.exports = {
    addService,
    getServices,
    updateServiceStatus,
    updateService
};