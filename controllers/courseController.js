const Course = require('../models/Course');
const Student = require('../models/Student');
const Subject = require('../models/Subject');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }
        res.status(200).json({ success: true, data: course });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).json({ success: true, data: course });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }
        res.status(200).json({ success: true, data: course });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        // Check if students are linked
        const studentCount = await Student.countDocuments({ courseId: req.params.id });
        if (studentCount > 0) {
            return res.status(400).json({ 
                success: false, 
                error: `Cannot delete course. ${studentCount} students are currently enrolled.` 
            });
        }

        // Check if subjects are linked
        const subjectCount = await Subject.countDocuments({ courseId: req.params.id });
        if (subjectCount > 0) {
            return res.status(400).json({ 
                success: false, 
                error: `Cannot delete course. ${subjectCount} subjects are linked to it.` 
            });
        }

        await Course.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
