const express  = require('express')
const clientRoute = express.Router()
const {verifyToken} = require('../middlewares/auth')
const clientController = require('../controllers/client/clientController')
const serviceRequestController = require('../controllers/client/serviceRequestController')
const addressController = require('../controllers/client/addressController')
const appointmentController = require('../controllers/client/appointmentController')
const couponController = require('../controllers/client/couponController')
const paymentController = require('../controllers/client/paymentController')


clientRoute.get('/getTopServices', clientController.getTopServices)

// getServices
clientRoute.get('/services', clientController.getServices);
clientRoute.get('/getFilterData', clientController.getFilterData);

// get single service
clientRoute.get('/service/:id', clientController.getService);

// get client details
clientRoute.get('/',verifyToken,clientController.getClientDetails)
clientRoute.put('/updateProfile', verifyToken, clientController.updateProfile);


// service Request Route
clientRoute.post('/serviceRequest',verifyToken,serviceRequestController.serviceRequest);
clientRoute.get('/getServiceRequests',verifyToken,serviceRequestController.getServiceRequests);
clientRoute.get('/getServiceRequest/:id',verifyToken,serviceRequestController.getServiceRequest);

// address Route
clientRoute.post('/addAddress',verifyToken,addressController.addAddress)
clientRoute.get('/getAddresses',verifyToken,addressController.getAddresses)
clientRoute.put('/editAddress',verifyToken,addressController.editAddress)
clientRoute.delete('/deleteAddress/:id',verifyToken,addressController.deleteAddress)

// appointment Route
clientRoute.get('/getAppointments',verifyToken,appointmentController.getAppointments)
clientRoute.get('/getCompletedAppointments', verifyToken, appointmentController.getCompletedAppointments);
clientRoute.patch('/cancelAppointment/:id',verifyToken,appointmentController.cancelAppointment)

// coupon Route
clientRoute.get('/getCoupons/:id', verifyToken, couponController.getCoupons)


// payment Route
clientRoute.post('/createRazorPayOrder', verifyToken, paymentController.createRazorPayOrder)
clientRoute.post('/verifyPayment', verifyToken, paymentController.verifyPayment)
clientRoute.post("/retryPaymentCreateOrder", verifyToken, paymentController.retryPaymentCreateOrder)
clientRoute.post("/verifyRazorpayPayment", verifyToken, paymentController.verifyRazorpayPayment)

module.exports = clientRoute