const ROLES = require('../../constants/roles');
const Appointment = require('../../models/appointment');
const Transaction = require('../../models/transactions');
const Wallet = require('../../models/wallet');
const paymentMethod = require('../../constants/paymentMethod');
const transactionTypes = require('../../constants/transactionType');
const paymentStatus = require('../../constants/paymentStatus');
const COMMISION_PERCENTAGE = require('../../constants/commision');

const getAppointments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = req.query.limit== 'all'? null : parseInt(req.query.limit) || 5;
        const appointments = await Appointment.find({ serviceProvider: req.userId, status:'pending' })
            .populate('service')
            .populate('client', 'fullname email phone')
            .populate('address')
            .sort({ date: -1, time: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        
        const totalPages = Math.ceil((await Appointment.countDocuments({ serviceProvider: req.userId, status:'pending' }))/limit);
        res.status(200).json({ success: true, appointments, totalPages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }
        
        if (appointment.serviceProvider.toString() !== req.userId) {
            return res.status(403).json({ success: false, message: "You are not authorized to cancel this appointment" });
        }

        if (appointment.status === 'cancelled') {
            return res.status(400).json({ success: false, message: "Appointment is already cancelled" });
        }

        appointment.status = 'cancelled';
        appointment.cancellationReason = reason;
        appointment.cancelledBy = ROLES.SERVICE;
        
        await appointment.save();
        
        res.status(200).json({ success: true, message: "Appointment cancelled successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}


const markAsCompleted = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        if (appointment.serviceProvider.toString() !== req.userId) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }
        if(appointment.date > new Date()){
            return res.status(400).json({ success: false, message: "You cannot mark an appointment as completed in the future" });
        }
        if(appointment.paymentMethod === paymentMethod.cash){
            await appointment.populate({
                path: 'serviceRequest',
                populate: {
                    path: 'quotation'
                }
            });

            const totalAmount = appointment.serviceRequest.quotation.amountBreakdown.reduce((total, field)=>total+field.amount, 0);

            const transaction = await Transaction.create({
                appointment: appointment._id,
                amount: totalAmount * COMMISION_PERCENTAGE,
                type: 'debit',
                transactionType: transactionTypes.COMMISSION_DEDUCTION,
            })

            const existingWallet = await Wallet.findOne({ userId: req.userId });


            if(!existingWallet){
                const wallet = new Wallet({
                    userId: req.userId,
                    transactions: [transaction._id],
                    balance: -(transaction.amount)
                });
                await wallet.save();
            }else{
                existingWallet.transactions.push(transaction._id);
                const existingBalance = existingWallet.balance;
                const newBalance = existingBalance - transaction.amount;
                existingWallet.balance = newBalance;
                await existingWallet.save();
            }
            appointment.paymentStatus = paymentStatus.completed;
        }
        appointment.status = 'completed';
        await appointment.save();

        res.status(200).json({ success: true, message: "Appointment marked as completed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getCompletedAppointments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const appointments = await Appointment.find({ serviceProvider: req.userId, status: { $in: ['completed', 'cancelled'] } })
            .populate('service')
            .populate('client', 'fullname email phone')
            .populate('address')
            .sort({ date: -1, time: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalPages = Math.ceil((await Appointment.countDocuments({ serviceProvider: req.userId, status: { $in: ['completed', 'cancelled'] } })) / limit);
        res.status(200).json({ success: true, appointments, totalPages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = {
    getAppointments,
    cancelAppointment,
    markAsCompleted,
    getCompletedAppointments
};
