const mongoose = require("mongoose");
const crypto = require("crypto");
const paymentStatus = require("../constants/paymentStatus");

const topupTokenSchema = new mongoose.Schema({
    token: {
        unique:true,
        required:true,
        type: String,
        default: function() {
            return crypto.randomBytes(32).toString("hex");
        }
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    paymentStatus:{
        type:String,
        enum:[paymentStatus.pending, paymentStatus.completed],
        default:paymentStatus.pending,
    }
})

module.exports = mongoose.model("TopupToken", topupTokenSchema);