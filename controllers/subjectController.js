const Subject = require('../models/Subject');

// @desc    Get all subjects or filter by course
// @route   GET /api/subjects
// @access  Private
exports.getSubjects = async (req, res) => {
    try {
        const query = req.query.courseId ? { courseId: req.query.courseId } : {};
        const subjects = await Subject.find(query).populate('courseId', 'name code');
        res.status(200).json({ success: true, count: subjects.length, data: subjects });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
exports.getSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id).populate('courseId', 'name code');
        if (!subject) {
            return res.status(404).json({ success: false, error: 'Subject not found' });
        }
        res.status(200).json({ success: true, data: subject });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Create subject
// @route   POST /api/subjects
// @access  Private/Admin
exports.createSubject = async (req, res) => {
    try {
        const subject = await Subject.create(req.body);
        res.status(201).json({ success: true, data: subject });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private/Admin
exports.updateSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!subject) {
            return res.status(404).json({ success: false, error: 'Subject not found' });
        }
        res.status(200).json({ success: true, data: subject });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
exports.deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);
        if (!subject) {
            return res.status(404).json({ success: false, error: 'Subject not found' });
        }
        // Note: Attendance records linked to this subject could be orphaned. 
        // Real-world systems might prevent deletion if attendance exists.
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
