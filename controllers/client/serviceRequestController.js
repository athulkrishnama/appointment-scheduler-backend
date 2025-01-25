const ServiceRequest = require('../../models/serviceRequests');
const serviceRequest =async (req, res)=>{
    try{
        const {address, service, date, time, additionalNotes, additionalDetails, recrringEndDate, serviceFrequency} = req.body;
        const client = req.userId;
        const serviceRequest = new ServiceRequest({address, service, date, time, additionalNotes, additionalDetails, recrringEndDate, serviceFrequency, client});
        await serviceRequest.save();
        res.status(201).json({ success: true, message: "Service request created successfully", serviceRequest });
    }catch(err){
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to create service request" });
    }
}

module.exports={
    serviceRequest
}