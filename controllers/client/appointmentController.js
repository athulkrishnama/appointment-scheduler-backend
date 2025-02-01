const Appointment = require('../../models/appointment');
const ROLES = require('../../constants/roles');

const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ client: req.userId })
            .populate('service')
            .populate('serviceProvider')
            .sort({ date: -1 });
        
        res.status(200).json({ success: true, appointments });
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

module.exports = {
    getAppointments,
    cancelAppointment
}