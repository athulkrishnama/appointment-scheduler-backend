const User = require('../models/user');
const Service = require('../models/services');
const STATUSES = require('../constants/statuses');
const Category = require('../models/category');
const ROLE = require('../constants/roles');
// Controller to fetch top 10 services
const getTopServices = async (req, res) => {
  try {
    const services = await User.find({ role: 'service', "serviceDetails.isAccepted": STATUSES.ACCEPTED, 'isActive': true })
      .select('fullname serviceDetails.description serviceDetails.logo')
      .limit(10);
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching top services:', error);
    res.status(500).json({ message: 'Failed to fetch services' });
  }
};

const getServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const serviceProviders = req.query.serviceProvider || '';
    const sortBy = req.query.sortBy || '';
    const filters = {};
    if (search) {
      filters.$or = [
        { serviceName: { $regex: search, $options: 'i' } },
        { serviceDescription: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      filters.category = { $in: category.split(',') };
    }
    if (serviceProviders) {
      filters.serviceProvider = { $in: serviceProviders.split(',') };
    }

    const sort = {}
    if (sortBy) {
      if (sortBy === 'A to Z') {
        sort.serviceName = 1
      } else if (sortBy === 'Z to A') {
        sort.serviceName = -1
      }
    }
    const skip = (page - 1) * limit;
    const services = await Service.find({ isActive: true, ...filters }).sort(sort).skip(skip).limit(limit);
    const totalPage = Math.ceil(await Service.countDocuments({ isActive: true, ...filters }) / limit);
    res.status(200).json({ success: true, services, curPage: page, totalPages: totalPage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFilterData = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    const serviceProviders = await User.find({ role: ROLE.SERVICE, isActive: true, 'serviceDetails.isAccepted': STATUSES.ACCEPTED });
    res.status(200).json({ success: true, categories, serviceProviders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = {
  getTopServices,
  getServices,
  getFilterData
};