const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
    client:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    addressId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    service:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
    
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);