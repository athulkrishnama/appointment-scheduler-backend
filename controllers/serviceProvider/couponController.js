const Coupon = require('../../models/coupon')

const getCoupons = async (req, res) => {
    try {
        const serviceProvider = req.userId
        const page = parseInt(req.query.page || 1);
        const limit = parseInt(req.query.limit || 5);

        // const coupons = await Coupon.find({serviceProvider, isActive: true, usedCount: {$expr: {$lt: ['$usedCount', '$limit']}}, expiryDate : {$gt: new Date()}});
        const coupons = await Coupon.find({serviceProvider})
            .sort({createdAt: -1})
            .skip((page - 1) * limit)
            .limit(limit)
        const totalPages = Math.ceil((await Coupon.countDocuments({serviceProvider})) / limit)
        res.status(200).json({success: true, coupons, totalPages})
    } catch (error) {
        res.status(500).json({success: false, message: error.message || 'Something went wrong'})
    }
}

const addCoupon = async (req, res) => {
    try {
        const {couponCode, description, discount, minAmount, limit, expiryDate} = req.body;
        const serviceProvider = req.userId
        const existingCoupon = await Coupon.findOne({couponCode, serviceProvider})
        if(existingCoupon) return res.status(400).json({success: false, message: 'Coupon already exists'})
        const newCoupon = new Coupon({
            couponCode,
            description,
            discount,
            minAmount,
            limit,
            expiryDate,
            serviceProvider
        })
        await newCoupon.save()
        res.status(201).json({success: true, message: 'Coupon added successfully', coupon: newCoupon})
    } catch (error) {
        res.status(500).json({success: false, message: error.message || 'Something went wrong'})
    }
}

const toggleCouponStatus = async (req, res) => {
    try {
        const {id} = req.params
        const status = req.body.status;
        const coupon = await Coupon.findByIdAndUpdate(id, {isActive: status})
        res.status(200).json({success: true, message: 'Coupon status changed successfully', coupon})
    } catch (error) {
        res.status(500).json({success: false, message: error.message || 'Something went wrong'})
    }
}

module.exports = { 
    getCoupons,
    addCoupon,
    toggleCouponStatus
}