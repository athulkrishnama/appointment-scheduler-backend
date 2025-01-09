const User = require("../models/user");
const Service = require("../models/services");
const STATUSES = require("../constants/statuses");
const ROLES = require("../constants/roles");

const serviceProviderRequests = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const requests = await User.find({ "role": ROLES.SERVICE, "serviceDetails.isAccepted": STATUSES.PENDING }).skip((page - 1) * limit).limit(limit);
        res.status(200).json({ success: true, requests });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to fetch requests" });
    }
};

const updateRequestStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Service provider not found" });
        }
        user.serviceDetails.isAccepted = status;
        await user.save();
        res.status(200).json({ success: true, message: "Request status updated successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to update request status" });
    }
};


const getClients = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const clients = await User.find({ "role": ROLES.CLIENT }).skip((page - 1) * limit).limit(limit);
        const totalPage = Math.ceil(await User.countDocuments({ "role": ROLES.CLIENT }) / limit);
        res.status(200).json({ success: true, clients, totalPage, curPage: page });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to fetch clients" });
    }
};

const updateClientStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Client not found" });
        }
        user.isActive = action === "block" ? false : true;
        await user.save();
        res.status(200).json({ success: true, message: "Client status updated successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to update client status" });
    }
};

const getServiceProvider = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const serviceProviders = await User.find({ "role": ROLES.SERVICE }).skip((page - 1) * limit).limit(limit);
        const totalPage = Math.ceil(await User.countDocuments({ "role": ROLES.SERVICE }) / limit);
        res.status(200).json({ success: true, serviceProviders, totalPage, curPage: page });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to fetch service providers" });
    }
};

const updateServiceProviderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Service provider not found" });
        }
        user.isActive = action === "block" ? false : true;
        await user.save();
        res.status(200).json({ success: true, message: "Service provider status updated successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to update service provider status" });
    }
};

const getServices = async (req, res) => {
    try {
        const providerId = req.query.providerId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const filters = {};
        if (providerId) {
            filters.serviceProvider = providerId;
        }
        const services = await Service.find(filters).skip((page - 1) * limit).limit(limit);
        const totalPage = Math.ceil(await Service.countDocuments(filters) / limit);
        res.status(200).json({ success: true, services, totalPage, curPage: page });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to fetch services" });
    }
};
module.exports = {
    serviceProviderRequests,
    updateRequestStatus,
    getClients,
    updateClientStatus,
    getServiceProvider,
    updateServiceProviderStatus,
    getServices
};