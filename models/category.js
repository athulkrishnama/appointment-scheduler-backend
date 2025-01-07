const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: [true, 'Category name is required'],
    },
    categoryDescription: {
        type: String,
        required: [true, 'Category description is required'],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model('Category', categorySchema);