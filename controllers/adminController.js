const User = require("../models/user");
const STATUSES = require("../constants/statuses");
const ROLES = require("../constants/roles");

const serviceProviderRequests = async (req, res) => {
    try {
        const requests = await User.find({ "role": ROLES.SERVICE, "serviceDetails.isAccepted": STATUSES.PENDING });
        res.status(200).json({ success: true, requests });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to fetch requests" });
    }
};

const updateRequestStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Service provider not found" });
        }
        user.serviceDetails.isAccepted = status;
        await user.save();
        res.status(200).json({ success: true, message: "Request status updated successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to update request status" });
    }
};
module.exports = { serviceProviderRequests, updateRequestStatus };