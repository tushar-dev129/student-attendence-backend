const Professor = require('../models/Professor');
const User = require('../models/User');

// @desc    Get all professors
// @route   GET /api/professors
// @access  Private/Admin
exports.getProfessors = async (req, res) => {
    try {
        const professors = await Professor.find().populate('userId', 'name email role');
        res.status(200).json({ success: true, count: professors.length, data: professors });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get single professor
// @route   GET /api/professors/:id
// @access  Private/Admin
exports.getProfessor = async (req, res) => {
    try {
        const professor = await Professor.findById(req.params.id).populate('userId', 'name email role');
        if (!professor) {
            return res.status(404).json({ success: false, error: 'Professor not found' });
        }
        res.status(200).json({ success: true, data: professor });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Create professor
// @route   POST /api/professors
// @access  Private/Admin
exports.createProfessor = async (req, res) => {
    const { name, email, password, phone, department, specialization } = req.body;

    try {
        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: 'professor'
        });

        // Create professor profile
        const professor = await Professor.create({
            userId: user._id,
            name,
            email,
            phone,
            department,
            specialization
        });

        res.status(201).json({ success: true, data: professor });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Update professor
// @route   PUT /api/professors/:id
// @access  Private/Admin
exports.updateProfessor = async (req, res) => {
    try {
        let professor = await Professor.findById(req.params.id);
        if (!professor) {
            return res.status(404).json({ success: false, error: 'Professor not found' });
        }

        professor = await Professor.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Also update name/email in User model if provided
        if (req.body.name || req.body.email) {
            await User.findByIdAndUpdate(professor.userId, {
                name: req.body.name,
                email: req.body.email
            });
        }

        res.status(200).json({ success: true, data: professor });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Delete professor
// @route   DELETE /api/professors/:id
// @access  Private/Admin
exports.deleteProfessor = async (req, res) => {
    try {
        const professor = await Professor.findById(req.params.id);
        if (!professor) {
            return res.status(404).json({ success: false, error: 'Professor not found' });
        }

        // Delete associated user
        await User.findByIdAndDelete(professor.userId);
        
        // Delete professor profile
        await Professor.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
