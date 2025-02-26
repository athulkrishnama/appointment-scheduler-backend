const mongoose = require('mongoose');
const reportStatus = require('../constants/reportStatus')
const reportActions = require('../constants/reportActions')

const ReportSchema = mongoose.Schema({
    appointment:{
        type:mongoose.Types.ObjectId,
        ref:'Appointment',
        require:true
    },
    client:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true
    },
    serviceProvider:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true
    },
    reason:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:Object.values(reportStatus),
        default:reportStatus.pending,
        required:true
    },
    actionTook:{
        type:String,
        enum:Object.values(reportActions)

    }
})

module.exports = mongoose.model("Report", ReportSchema);