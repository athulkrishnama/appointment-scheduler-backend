
const serviceRequest =async (req, res)=>{
    try{
        console.log(req.body);
    }catch(err){
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to create service request" });
    }
}

module.exports={
    serviceRequest
}