const Appointment = require('../../models/appointment');

const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ serviceProvider: req.userId })
            .populate('service')
            .populate('client', 'fullname email phone')
            .populate('address')
            .sort({ date: -1, time: 1 });
        
        res.status(200).json({ success: true, appointments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports = {
    getAppointments
}
