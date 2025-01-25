const ServiceRequest = require('../../models/serviceRequests');
const serviceRequest =async (req, res)=>{
    try{
        const {address, service, date, time, additionalNotes, additionalDetails, endDate, serviceFrequency} = req.body;
        const client = req.userId;
        const serviceRequest = new ServiceRequest({address, service, date, time, additionalNotes, additionalDetails, recrringEndDate:endDate, serviceFrequency, client});
        await serviceRequest.save();
        res.status(201).json({ success: true, message: "Service request created successfully", serviceRequest });
    }catch(err){
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to create service request" });
    }
}

const getServiceRequests = async (req, res)=>{
    try {
        const client = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const serviceRequests = await ServiceRequest.find({client}).sort({createdAt:-1}).skip((page - 1) * limit).limit(limit).populate('service');
        const totalPages = Math.ceil((await ServiceRequest.countDocuments({client}))/limit);
        res.status(200).json({ success: true, serviceRequests, totalPages });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to get service requests" });
    }
}

module.exports={
    serviceRequest,
    getServiceRequests
}