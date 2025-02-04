const mongoose = require("mongoose");
const transactionTypes = require('../constants/transactionType');

const transactionSchema = new mongoose.Schema({
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: false },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    transactionType: { type: String, enum: Object.values(transactionTypes), required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);