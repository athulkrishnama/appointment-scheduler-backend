const User = require('../models/user');
const STATUSES = require('../constants/statuses');
// Controller to fetch top 10 services
const getTopServices = async (req, res) => {
  try {
    const services = await User.find({ role: 'service' , "serviceDetails.isAccepted":STATUSES.ACCEPTED})
      .select('fullname serviceDetails.description serviceDetails.logo')
      .limit(10);
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching top services:', error);
    res.status(500).json({ message: 'Failed to fetch services' });
  }
};

module.exports = { getTopServices };