const User = require('../../models/user');
const Service = require('../../models/services');
const STATUSES = require('../../constants/statuses');
const Category = require('../../models/category');
const ROLE = require('../../constants/roles');
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
    const sortBy = req.query.sortBy || 'A to Z';
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
    const services = await Service.aggregate([
      { $match: { isActive: true, ...filters } }, 
      {
        $lookup: {
          from: 'categories', 
          localField: 'category', 
          foreignField: '_id', 
          as: 'category',
        },
      },
      { $unwind: '$category' }, 
      { $match: { 'category.isActive': true } },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
    ]);
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

const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('serviceProvider');
    if(!service || !service.isActive) return res.status(404).json({ success: false, message: "Service not found" });
    res.status(200).json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: "Invalid Service" });
  }
};

const getClientDetails = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if(!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Invalid User" });
  }
}


const updateProfile = async (req,res)=>{
  try {
    console.log(req.body)

    const user = await User.findById(req.userId);
    if(!user) return res.status(404).json({ success: false, message: "User not found" });

    user.fullname = req.body.fullname;
    user.phone = req.body.phone
    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
}
module.exports = {
  getTopServices,
  getServices,
  getFilterData,
  getService,
  getClientDetails,
  updateProfile
};