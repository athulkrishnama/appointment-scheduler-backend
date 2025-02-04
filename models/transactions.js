const mongoose = require("mongoose");
const transactionTypes = require('../constants/transactionType');
const paymentMethod = require('../constants/paymentMethod');
const paymentStatus = require('../constants/paymentStatus');

const transactionSchema = new mongoose.Schema({
    transactionId: { type: String, unique: true, required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: false },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    transactionType: { type: String, enum: [transactionTypes.SERVICE_PAYMENT, transactionTypes.REFUND, transactionTypes.WITHDRAWAL, transactionTypes.DEPOSIT], required: true },
    paymentMethod: { type: String, enum: [paymentMethod.cash, paymentMethod.online], required: true },
    paymentStatus: { type: String, enum: [paymentStatus.pending, paymentStatus.completed, paymentStatus.failed], required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);