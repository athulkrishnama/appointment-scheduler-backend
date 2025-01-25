const ServiceRequest = require('../../models/serviceRequests');

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

module.exports = {
    getServiceRequests
}