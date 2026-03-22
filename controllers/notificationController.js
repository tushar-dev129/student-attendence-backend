const Notification = require('../models/Notification');
const Student = require('../models/Student');

// @desc    Create new notification
// @route   POST /api/notifications
// @access  Private/Admin
exports.createNotification = async (req, res) => {
    try {
        const { title, message, audience, courseId } = req.body;

        const notification = await Notification.create({
            title,
            message,
            audience,
            courseId: audience === 'course' ? courseId : null,
            createdBy: req.user._id
        });

        res.status(201).json({ success: true, data: notification });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get notifications for logged-in student
// @route   GET /api/notifications
// @access  Private/Student
exports.getNotifications = async (req, res) => {
    try {
        // Find the student profile first to get their courseId
        const student = await Student.findOne({ userId: req.user._id });
        
        if (!student) {
            return res.status(404).json({ success: false, error: 'Student profile not found' });
        }

        const notifications = await Notification.find({
            $or: [
                { audience: 'all' },
                { audience: 'course', courseId: student.courseId }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: notifications });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get all notifications for admin
// @route   GET /api/notifications/admin
// @access  Private/Admin
exports.getAdminNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .populate('courseId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: notifications });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
