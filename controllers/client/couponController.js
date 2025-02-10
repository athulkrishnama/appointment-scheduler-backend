const Coupon = require('../../models/coupon');

const getCoupons = async (req, res) => {
    try {
        const {id:serviceProvider} = req.params
        const coupons = await Coupon.find({serviceProvider, isActive: true, $expr: {$lt: ['$usedCount', '$limit']}, expiryDate : {$gt: new Date()}})
        res.status(200).json({success: true, coupons})
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: error.message || 'Something went wrong'})
    }
} 

module.exports = {
    getCoupons
}