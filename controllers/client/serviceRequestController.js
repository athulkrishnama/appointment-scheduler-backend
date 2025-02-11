const ServiceRequest = require('../../models/serviceRequests');
const serviceRequest =async (req, res)=>{
    try{
        const {address, service, date, time, additionalNotes, additionalDetails, endDate, serviceFrequency} = req.body;
        const client = req.userId;
        const serviceRequest = new ServiceRequest({address, service, date, time, additionalNotes, additionalDetails, recurringEndDate:endDate, serviceFrequency, client, requestedAt:Date.now()});
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
        const serviceRequests = await ServiceRequest.find({client, status:'pending'}).sort({createdAt:-1}).skip((page - 1) * limit).limit(limit).populate({
            path: 'service',
            populate: {
              path: 'serviceProvider', 
            }
          });
        const totalPages = Math.ceil((await ServiceRequest.countDocuments({client, status:'pending'}))/limit);
        res.status(200).json({ success: true, serviceRequests, totalPages });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to get service requests" });
    }
}

const getServiceRequest = async (req,res) =>{
    try {
        const serviceRequest = await ServiceRequest.findById(req.params.id).populate([
            {
                path: 'service',
                populate: {
                  path: 'serviceProvider', 
                }
              },
              {
                path: 'client'
              },
              {
                path: 'address'
              },
              {
                path: 'quotation'
              }
        ]);
        res.status(200).json({ success: true, serviceRequest });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to get service request" });
    }
}

module.exports={
    serviceRequest,
    getServiceRequests,
    getServiceRequest
}