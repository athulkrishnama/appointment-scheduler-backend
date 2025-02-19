const User = require("../models/user");
const Service = require("../models/services");
const STATUSES = require("../constants/statuses");
const ROLES = require("../constants/roles");
const Appointment = require("../models/appointment");
const Wallet = require("../models/wallet");
const {sendAcceptMail, sendRejectMail} = require("../helpers/emailHelper");

const serviceProviderRequests = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;
        const requests = await User.find({ "role": ROLES.SERVICE, "serviceDetails.isAccepted": STATUSES.PENDING }).skip((page - 1) * limit).limit(limit);
        const totalPage = Math.ceil(await User.countDocuments({ "role": ROLES.SERVICE, "serviceDetails.isAccepted": STATUSES.PENDING }) / limit);
        res.status(200).json({ success: true, requests, totalPage, curPage: page });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to fetch requests" });
    }
};

const updateRequestStatus = async (req, res) => {
    try {
        const { id, status , reason} = req.body;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Service provider not found" });
        }
        user.serviceDetails.isAccepted = status;
        await user.save();
        if(status === STATUSES.ACCEPTED){
            await sendAcceptMail(user.email, user.fullname);
        }else if(status === STATUSES.REJECTED){
            await sendRejectMail(user.email, user.fullname, reason);
        }
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
        const serviceProviders = await User.find({ "role": ROLES.SERVICE , 'serviceDetails.isAccepted':STATUSES.ACCEPTED}).skip((page - 1) * limit).limit(limit);
        const totalPage = Math.ceil(await User.countDocuments({ "role": ROLES.SERVICE , 'serviceDetails.isAccepted':STATUSES.ACCEPTED}) / limit);
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

const getDashboardData = async (req, res) => {
    try {
        const activeServiceProviders = await User.countDocuments({ "role": ROLES.SERVICE , 'serviceDetails.isAccepted':STATUSES.ACCEPTED});
        const activeClients = await User.countDocuments({ "role": ROLES.CLIENT });
        const totalServices = await Service.countDocuments();
        const totalAppointments = await Appointment.countDocuments();
        res.status(200).json({ success: true, activeServiceProviders, activeClients, totalServices, totalAppointments });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to fetch data" });
    }
}

const getWalletData = async (req, res) => {
    try {
        const wallet = await Wallet.findOne({userId: req.userId}).populate([{path:'transactions', populate: {path:'appointment', populate:{path:'client'}}}]);
        res.status(200).json({success: true, wallet})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false, message: "Failed to get wallet data"})
    }
}
module.exports = {
    serviceProviderRequests,
    updateRequestStatus,
    getClients,
    updateClientStatus,
    getServiceProvider,
    updateServiceProviderStatus,
    getServices,
    getDashboardData,
    getWalletData
};