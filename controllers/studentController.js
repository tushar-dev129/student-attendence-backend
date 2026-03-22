const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Create new student
// @route   POST /api/students
// @access  Private/Admin
exports.createStudent = async (req, res) => {
    const { name, email, password, phone, dateOfBirth, gender, address, courseId } = req.body;

    try {
        // 1. Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        // 2. Create User account for student
        user = await User.create({
            name,
            email,
            password,
            role: 'student'
        });

        // 3. Create Student record
        const student = await Student.create({
            userId: user._id,
            name,
            email,
            phone,
            dateOfBirth,
            gender,
            address,
            courseId
        });

        res.status(201).json({
            success: true,
            data: student
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find().populate('userId', 'name role').populate('courseId', 'name code');
        res.status(200).json({ success: true, count: students.length, data: students });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private (Admin or Own data)
exports.getStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('userId', 'name role')
            .populate('courseId', 'name code');

        if (!student) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }

        // Allow Admin or the student themselves to view
        if (req.user.role !== 'admin' && req.user._id.toString() !== student.userId._id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized to view this profile' });
        }

        res.status(200).json({ success: true, data: student });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
exports.updateStudent = async (req, res) => {
    try {
        let student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }

        student = await Student.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: student });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }

        // Delete associated User
        await User.findByIdAndDelete(student.userId);

        // Delete Student record
        await Student.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
