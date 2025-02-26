const User = require("../models/user");
const Service = require("../models/services");
const STATUSES = require("../constants/statuses");
const ROLES = require("../constants/roles");
const Appointment = require("../models/appointment");
const Wallet = require("../models/wallet");
const Report = require("../models/report")
const reportStatus = require("../constants/reportStatus")
const reportActions = require("../constants/reportActions")
const {sendAcceptMail, sendRejectMail, sendReportMails} = require("../helpers/emailHelper");
const { serviceProvider } = require("../constants/sender");

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

const getReports = async (req, res) =>{
    try {
        const reports = await Report.find({status:reportStatus.pending}).populate('client').populate('serviceProvider').populate('appointment')
        res.status(200).json({success:true, reports})
    } catch (error) {
        console.log(error);
        res.status(500).json({success:false, message:"Failed to fetch report data"})
    }
}

const takeAction = async(req,res)=>{
    try {
        const {report:reportId, action} = req.body

        const report = await Report.findOne({_id:reportId}).populate([
            {path:'client'},
            {path:'serviceProvider'},
            {path:"appointment"}
        ])

        if(!report)return res.status(404).json({success:false, message:"Report not found"});

        if(action === reportActions.ignore){
            const emailResponse = await sendReportMails(report.client, report.serviceProvider, report?.appointment?.service, reportActions.ignore);
            report.actionTook = reportActions.ignore;
        }else if(action === reportActions.warn){
            const emailResponse = await sendReportMails(report.client, report.serviceProvider, report?.appointment?.service, reportActions.warn);
            report.actionTook = reportActions.warn;
        }else if(action === reportActions.block){
            const emailResponse = await sendReportMails(report.client, report.serviceProvider, report?.appointment?.service, reportActions.block)
            
            const serviceProvider = await User.findByIdAndUpdate(report.serviceProvider._id, {isActive:false})
        }else{
            return res.status(400).json({success:false, message:"invalid action"});
        }
        report.status = reportStatus.completed
        await report.save()
        const message = action === reportActions.block ? "Service Provider Blocked Successfully": action === reportActions.warn ? "warning send to service provider scuccessfully": "Report ignored"
        return res.status(200).json({success:true, message})

    } catch (error) {
        console.log(error)
        res.status(500).json({success:false, message:"Error while taking action"})
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
    getWalletData,
    getReports,
    takeAction
};