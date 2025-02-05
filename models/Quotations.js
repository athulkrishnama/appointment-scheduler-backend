const mongoose = require("mongoose");

const QuotationSchema = new mongoose.Schema({
    serviceRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceRequest",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
        required: true,
    },
    amountBreakdown:[
        {
            description:{
                type: String,
                required: true
            },
            amount:{
                type: Number,
                required: true
            }
        }
    ]

}, { timestamps: true });

module.exports = mongoose.model("Quotation", QuotationSchema);