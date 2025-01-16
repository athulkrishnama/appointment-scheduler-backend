const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    fullName:{
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
     client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
    }
});

module.exports = mongoose.model("Address", addressSchema);