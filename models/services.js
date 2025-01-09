const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    serviceName: {
        type: String,
        required: [true, "Service name is required"],
    },
    serviceDescription: {
        type: String,
        required: [true, "Service description is required"],
    },
    isActive: {
        type: Boolean,
        default: true,
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
        },
    ],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Category is required"],
    },
    image: {
        type: String,
    },
    serviceProvider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Service provider is required"],
    },
},
    {
        timestamps: true,
    }

);

module.exports = mongoose.model("Service", serviceSchema);