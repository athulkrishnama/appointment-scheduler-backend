const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    transactions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction",
            required: true       
        }
    ],
    balance:{
        type:Number,
        required:true
    },
}, { timestamps: true });

module.exports = mongoose.model("Wallet", walletSchema);