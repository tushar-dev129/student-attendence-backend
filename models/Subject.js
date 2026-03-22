const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a subject name'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Please add a subject code'],
        trim: true,
        uppercase: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure subject name is unique within a course
subjectSchema.index({ name: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
