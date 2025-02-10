const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

const instance = new Razorpay({key_id:process.env.RAZORPAY_KEY_ID, key_secret:process.env.RAZORPAY_KEY_SECRET}) 

const createOrder = async (amount) => {
    try {
        const order = await instance.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: "order_rcptid_11"
        })
        return order
    } catch (error) {
        throw error
    }
}

const verifyPayment = async (orderId, signature, paymentId) => {
    try {
        const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        shasum.update(orderId + "|" + paymentId);
        const digest = shasum.digest('hex');
        if (digest !== signature) {
            return false
        }
        return true
    } catch (error) {
        throw error
    }
}

module.exports = {
    createOrder,
    verifyPayment
}