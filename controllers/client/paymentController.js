const razorpayHelper = require('../../helpers/razorpay')
const Appointment = require('../../models/appointment');
const Coupon = require('../../models/coupon');
const PAYMENT_STATUS = require('../../constants/paymentStatus');
const PAYMENT_METHOD = require('../../constants/paymentMethod');
const walletHelper = require('../../helpers/wallerHelper');
const COMMISION_PERCENTAGE = require('../../constants/commision');
const TRANSACTION_TYPE = require('../../constants/transactionType');
const User = require('../../models/user');
const ROLES = require('../../constants/roles');

const incrementCouponUsedCount = async (couponId) => {
    const coupon = await Coupon.findById(couponId);
    coupon.usedCount += 1;
    await coupon.save();
}

const createRazorPayOrder = async (req, res) => {
    try {
        const { appointmentId, couponId } = req.body;
        let discountAmount = 0;

        const appointment = await Appointment.findById(appointmentId)

        if (couponId) {
            const coupon = await Coupon.findById(couponId)
            if (!coupon) throw new Error('Coupon not found')
            if (coupon.expiryDate < Date.now()) throw new Error('Coupon is expired')
            if (coupon.usedCount >= coupon.limit) throw new Error('Coupon limit exceeded')

            const couponDiscount = coupon.discount;
            const couponDiscountAmount = (appointment.amount * couponDiscount) / 100;
            discountAmount = coupon.maxDiscount > couponDiscountAmount ? couponDiscountAmount : coupon.maxDiscount;
            appointment.coupon = couponId;
            appointment.couponDiscount = discountAmount;
        }

        if (!appointment) throw new Error('Appointment not found')
        if (appointment.status === 'cancelled') throw new Error('Appointment is cancelled')
        if (appointment.paymentStatus === PAYMENT_STATUS.completed) throw new Error('Payment is already completed')
        if (appointment.paymentMethod === PAYMENT_METHOD.cash) throw new Error('Appointment is already completed')

        const totalAmount = appointment.amount;

        const finalAmount = totalAmount - discountAmount;

        const order = await razorpayHelper.createOrder(finalAmount);
        appointment.finalAmount = finalAmount;
        appointment.save()
        res.status(200).json({ success: true, order })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.message })
    }
}


const verifyPayment = async (req, res) => {
    try {
        let verified = true;

        const { razorpay_payment_id, razorpay_order_id, appointmentId, razorpay_signature, paymentStatus } = req.body

        const appointment = await Appointment.findById(appointmentId)


        verified = await razorpayHelper.verifyPayment(razorpay_order_id, razorpay_signature, razorpay_payment_id)


        if (appointment.coupon) await incrementCouponUsedCount(appointment.coupon);



        if (verified) {
            const platformFee = appointment.amount * COMMISION_PERCENTAGE;
            const serviceFee = appointment.finalAmount - platformFee;

            const res = await walletHelper.addAmountToWallet(appointment.serviceProvider, serviceFee, TRANSACTION_TYPE.SERVICE_PAYMENT, appointmentId);
            const admin = await User.findOne({ role: ROLES.ADMIN })
            const adminRes = await walletHelper.addAmountToWallet(admin._id, platformFee, TRANSACTION_TYPE.PLATFORM_FEE, appointmentId);

            if (!res || !adminRes) {
                throw new Error("Failed to add amount to wallet")
            }
        }
        appointment.paymentStatus = verified ? PAYMENT_STATUS.completed : PAYMENT_STATUS.failed;
        await appointment.save();
        const message = verified ? "Payment verified successfully" : "Payment verification failed";
        res.status(200).json({ success: true, message })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

const retryPaymentCreateOrder = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointment = await Appointment.findById(appointmentId)
        if (!appointment) throw new Error('Appointment not found')
        if (appointment.status === 'cancelled') throw new Error('Appointment is cancelled')
        if (appointment.paymentStatus === PAYMENT_STATUS.completed) throw new Error('Payment is already completed')
        if (appointment.paymentMethod === PAYMENT_METHOD.cash) throw new Error('Appointment is already completed')
        const order = await razorpayHelper.createOrder(appointment.finalAmount);
        res.status(200).json({ success: true, order })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}


const verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, appointmentId, razorpay_signature } = req.body
        const appointment = await Appointment.findById(appointmentId)
        if (!appointment) throw new Error('Appointment not found')
        if (appointment.status === 'cancelled') throw new Error('Appointment is cancelled')
        if (appointment.paymentStatus === PAYMENT_STATUS.completed) throw new Error('Payment is already completed')
        if (appointment.paymentMethod === PAYMENT_METHOD.cash) throw new Error('Appointment is already completed')
        const verified = await razorpayHelper.verifyPayment(razorpay_order_id, razorpay_signature, razorpay_payment_id)
        if (!verified) throw new Error('Payment verification failed')

        if (verified) {
            const platformFee = appointment.amount * COMMISION_PERCENTAGE;
            const serviceFee = appointment.finalAmount - platformFee;

            const res = await walletHelper.addAmountToWallet(appointment.serviceProvider, serviceFee, TRANSACTION_TYPE.SERVICE_PAYMENT, appointmentId);
            const admin = await User.findOne({ role: ROLES.ADMIN })
            const adminRes = await walletHelper.addAmountToWallet(admin._id, platformFee, TRANSACTION_TYPE.PLATFORM_FEE, appointmentId);

            if (!res || !adminRes) {
                throw new Error("Failed to add amount to wallet")
            }
        }
        appointment.paymentStatus = verified ? PAYMENT_STATUS.completed : PAYMENT_STATUS.failed;
        await appointment.save();
        const message = verified ? "Payment verified successfully" : "Payment verification failed";
        res.status(200).json({ success: true, message })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = {
    createRazorPayOrder,
    verifyPayment,
    retryPaymentCreateOrder,
    verifyRazorpayPayment
}