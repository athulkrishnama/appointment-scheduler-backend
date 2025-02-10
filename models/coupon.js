const mongoose = require("mongoose");
const { validate } = require("./services");

const couponSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    description: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        required: true,
        validate: {
            validator: function (value) {
                return value < 100 && value > 0;
            },
            message: 'Discount should be between 0 and 99'
        }
    },
    serviceProvider: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    }
    ,
    minAmount: {
        type: Number,
        required: true,
        validate: {
            validator: function (value) {
                return value > 0;
            },
            message: 'Minimum amount should be greater than 0'
        }
    },
    maxDiscount: {
        type: Number,
        required: true,
        validate: {
            validator: function (value) {
                return value > 0;
            },
            message: 'Maximum discount should be greater than 0'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    limit: {
        type: Number,
        default: 1,
        validate: {
            validator: function (value) {
                return value >= 0;
            },
            message: 'Limit should be greater than or equal to 0'
        }
    },
    usedCount: {
        type: Number,
        default: 0,
        validate: {
            validator: function (value) {
                return value <= this.limit;
            },
            message: "Limit exceeded"
        }
    }
    ,
    expiryDate: {
        type: Date,
        required: true
    }
}, { timestamps: true });

// 

// couponSchema.statics.incrementUsedCount = async (couponId) => {
//     const coupon = await Coupon.findById(couponId);
//     if (!coupon) {
//         throw new Error("Coupon not found");
//     }
//     if (coupon.usedCount >= coupon.limit) {
//         throw new Error("Limit exceeded");
//     }
//     const updatedCoupon = await Coupon.findByIdAndUpdate(
//         couponId,
//         {
//             $inc: { usedCount: 1 }
//         }, {
//         runValidators: true
//     }
//     )
//     coupon.usedCount++;
//     await coupon.save();
// }

module.exports = mongoose.model("Coupon", couponSchema);