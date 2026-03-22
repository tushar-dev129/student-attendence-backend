const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a course name'],
        unique: true,
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Please add a course code'],
        unique: true,
        trim: true,
        uppercase: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    duration: {
        type: Number,
        required: [true, 'Please add a duration (number of years)']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Course', courseSchema);
