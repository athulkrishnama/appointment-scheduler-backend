const Report = require('../../models/report')

const createReport = async(req,res)=>{
    try {
        const {appointment,   serviceProvider, reason} = req.body;
        const client = req.userId;
        const existingReport  = await Report.findOne({appointment});
        if(existingReport){
            return res.status(400).json({success:false, message:"Already reported this appointment"});
        }

        const report = new Report({appointment, serviceProvider, reason, client});
        await report.save()
        res.status(200).json({success:true, message:"Successfully reported"})
    } catch (error) {
        res.status(500).json({success:false, message:"Internal Server Error"})
    }
}

module.exports = {
    createReport
}