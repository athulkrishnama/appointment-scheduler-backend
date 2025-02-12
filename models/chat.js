const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    serviceRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceRequest",
        required: true,
    },
    messageType: {
        type: String,
        enum: ["text", "quotation"],
        required: true,
    },
    message: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        // validate: {
        //     validator: function (value) {
        //         return typeof value === 'string' || (typeof value === 'object' && value instanceof mongoose.Types.ObjectId);
        //     },
        //     message: 'Message must be a string or a valid reference to a quotation model.'
        // },
        ref: function() {
            return this.messageType !== 'text' ? 'Quotation' : null;
        },
    },
    sender: {
        type:String,
        enum: ["client", "service provider"],
        required: true,
    },
    senderId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true,
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true,
    },

    // for implementing status in future
    // status: {
    //     type: String,
    //     enum: ["sent", "received"],
    //     default: "sent",
    //     required: true,
    // }

}, { timestamps: true });


module.exports = mongoose.model("Chat", chatSchema);