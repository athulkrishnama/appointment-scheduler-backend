const mongoose = require("mongoose");
const chatType = require("../constants/chatType");

const notificationSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    message:{
        type:String,
        required: true,
    },
    type:{
        type:String,
        enum:Object.values(chatType),
        required: true,
    },
    senderName:{
        type:String,
        required: true,
    },
    serviceRequest:{
        type:String,
        required: true,
    },
    isRead:{
        type:Boolean,
        default:false,
        required: true,
    }
},
{
    timestamps: true,
})
module.exports = mongoose.model("Notification", notificationSchema);