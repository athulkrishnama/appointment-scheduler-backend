const mongoose = require("mongoose");
const ROLES = require("../constants/roles");
const paymentMethod = require('../constants/paymentMethod');
const paymentStatus = require('../constants/paymentStatus');
const appointmentSchema = new mongoose.Schema({
    serviceRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceRequest",
        required: true,
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    serviceProvider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
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
    cancellationReason: {
        type: String,
        required: ()=>this.status === "cancelled",
    },
    cancelledBy: {
        type:String,
        enum: [ROLES.CLIENT, ROLES.SERVICE],
        required: ()=>this.status === "cancelled",
    },
    additionalNotes: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentMethod:{
        type:String,
        enum: Object.values(paymentMethod),
        required:true,
    },

    paymentStatus:{
        type:String,
        enum:Object.values(paymentStatus),
        default:paymentStatus.pending,
        required:true
    },
    coupon:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Coupon',
    },
    couponDiscount: {
        type: Number,
        default:0
    },
    finalAmount:{
        type: Number,
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