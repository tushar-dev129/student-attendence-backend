const Notification = require('../models/Notification');
const Student = require('../models/Student');
const Professor = require('../models/Professor');
const Course = require('../models/Course');

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
        let query = {};
        if (req.user.role === 'professor') {
            const professor = await Professor.findOne({ userId: req.user._id });
            if (professor) {
                const course = await Course.findOne({ name: professor.department });
                if (course) {
                    query = {
                        $or: [
                            { audience: 'all' },
                            { audience: 'course', courseId: course._id }
                        ]
                    };
                }
            }
        }

        const notifications = await Notification.find(query)
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
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        if (req.user.role !== 'admin' && notification.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this notification' });
        }

        await notification.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
