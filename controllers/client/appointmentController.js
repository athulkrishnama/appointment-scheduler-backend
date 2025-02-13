const Appointment = require('../../models/appointment');
const ROLES = require('../../constants/roles');

const getAppointments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = req.query.limit== 'all'? null : parseInt(req.query.limit) || 5;
        const appointments = await Appointment.find({ client: req.userId, status: 'pending' })
            .populate('service')
            .populate('serviceProvider')
            .sort({ date: -1 })
            .skip((page - 1) * (limit || 5))
            .limit(limit);
        const totalPages = Math.ceil((await Appointment.countDocuments({ client: req.userId, status: 'pending' })) / (limit || 5));
        res.status(200).json({ success: true, appointments, totalPages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// 
const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const {reason} = req.body;
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }
        if(appointment.client.toString() !== req.userId){
            return res.status(403).json({ success: false, message: "You are not authorized to cancel this appointment" });
        }
        if (appointment.status === 'cancelled') {
            return res.status(400).json({ success: false, message: "Appointment is already cancelled" });
        }
        appointment.status = 'cancelled';
        appointment.cancellationReason = reason;
        appointment.cancelledBy = ROLES.CLIENT;
        await appointment.save();
        res.status(200).json({ success: true, message: "Appointment cancelled successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const getCompletedAppointments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = req.query.limit === 'all' ? null : parseInt(req.query.limit) || 5;
        const appointments = await Appointment.find({ client: req.userId, status: { $in: ['completed', 'cancelled'] } })
            .populate('service')
            .populate('serviceProvider')
            .populate('coupon')
            .sort({ date: -1 })
            .skip((page - 1) * limit) 
            .limit(limit);
        const totalPages = Math.ceil((await Appointment.countDocuments({ client: req.userId, status: { $in: ['completed', 'cancelled'] } })) / (limit || 5));
        res.status(200).json({ success: true, appointments, totalPages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = {
    getAppointments,
    cancelAppointment,
    getCompletedAppointments
}