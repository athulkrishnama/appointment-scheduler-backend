const User = require('../models/user');

// Controller to fetch top 10 services
const getTopServices = async (req, res) => {
  try {
    const services = await User.find({ role: 'service' })
      .select('fullname serviceDetails.description')
      .limit(10);
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching top services:', error);
    res.status(500).json({ message: 'Failed to fetch services' });
  }
};

module.exports = { getTopServices };