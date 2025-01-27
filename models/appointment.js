const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    serviceRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceRequest",
        required: true,
        autopopulate: true
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "completed", "cancelled"],
        default: "pending",
        required: true,
    },
    additionalNotes: {
        type: String,
        required: true,
    },
    additionalDetails: [
        {
            fieldName: {
                type: String,
                required: [true, "Field name is required"],
            },
            fieldType: {
                type: String,
                enum: ["number", "string", ],
                required: [true, "Field type is required"],
            },
            value: {
                type: String,
                required: [true, "Value is required"],
            }
        },
    ],
    address: {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
        },
        area: {
            type: String,
            required: [true, "Area is required"],
        },
        district: {
            type: String,
            required: [true, "District is required"],
        },
        state: {
            type: String,
            required: [true, "State is required"],
        },
        pincode: {
            type: String,
            required: [true, "Pincode is required"],
        },
    },
    service:{
        serviceName:{
            type: String,
            required: [true, "Service name is required"],
        },
        serviceDescription:{
            type: String,
            required: [true, "Service description is required"],
        },
        image:{
            type: String,
        },
        additionalDetails: [
            {
                fieldName: {
                    type: String,
                    required: [true, "Field name is required"],
                },
                fieldType: {
                    type: String,
                    enum: ["number", "string", ],
                    required: [true, "Field type is required"],
                }
            },
        ],
    }
}, { timestamps: true });


module.exports = mongoose.model("Appointment", appointmentSchema);