const ServiceRequest = require('../../models/serviceRequests');
const Quotation = require('../../models/quotations');
const Chat = require('../../models/chat');
const types = require('../../constants/chatType');
const sender = require('../../constants/sender');

const getServiceRequests = async (req, res) => {
    try {
        const serviceProvider = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const serviceRequests = await ServiceRequest.find().populate([{
            path: 'service',
            match: { serviceProvider: serviceProvider }
        },{
            path: 'client'
        }]).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);

        const totalServiceRequests = await ServiceRequest.find().populate({
            path: 'service',
            match: { serviceProvider: serviceProvider }
        });
        const totalPages = Math.ceil(totalServiceRequests.length / limit);
        res.status(200).json({ success: true, serviceRequests, totalPages });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to get service requests" });
    }
}

const getServiceRequest = async (req, res) => {
    try {
        const serviceRequestId = req.params.id;
        const serviceRequest = await ServiceRequest.findById(serviceRequestId).populate([{
            path: 'service',
            // match: { serviceProvider: serviceProvider }
        },{
            path: 'client'
        }]);
        res.status(200).json({ success: true, serviceRequest });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to get service request" });
    }
}

const createQuotation = async (req, res) => {
    try {
        const requestId = req.params.id;
        const amountBreakdown = req.body;
        const quotation = await new Quotation({
            serviceRequest: requestId,
            amountBreakdown
        });
        const newQuotation = await quotation.save();
        if(newQuotation){
            const chat = await new Chat({
                messageType: types.quotation,
                message: newQuotation._id,
                serviceRequest: requestId,
                sender: sender.serviceProvider
            });
            await chat.save();
        }
        res.status(200).json({ success: true, message: "Quotation created successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to create quotation" });
    }
}

const getChat = async (req, res) => {
    try {
        const requestId = req.params.id;
        const chat = await Chat.find({ serviceRequest: requestId }).populate('message');
        res.status(200).json({ success: true, chat });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to get chat" });
    }
}

module.exports = {
    getServiceRequests,
    getServiceRequest,
    createQuotation,
    getChat
}