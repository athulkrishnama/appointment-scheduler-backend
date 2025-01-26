const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    serviceRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceRequest",
        required: true,
        autopopulate: true
    },
    messageType: {
        type: String,
        enum: ["text", "quotation"],
        required: true,
    },
    message: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        validate: {
            validator: function (value) {
                return typeof value === 'string' || (typeof value === 'object' && value instanceof mongoose.Types.ObjectId);
            },
            message: 'Message must be a string or a valid reference to a quotation model.'
        },
        ref: function() {
            return this.messageType !== 'text' ? 'Quotation' : null;
        },
        autopopulate: function() {
            return this.messageType !== 'text';
        }
    },
    sender: {
        type:String,
        enum: ["client", "service provider"],
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

// chatSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model("Chat", chatSchema);