const Student = require('../models/Student');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
    try {
        const [
            studentCount,
            courseCount,
            subjectCount,
            attendanceCount,
            recentStudents,
            recentAttendance
        ] = await Promise.all([
            Student.countDocuments(),
            Course.countDocuments(),
            Subject.countDocuments(),
            Attendance.countDocuments(),
            Student.find().sort({ createdAt: -1 }).limit(5).populate('courseId', 'name'),
            Attendance.find().sort({ date: -1, createdAt: -1 }).limit(5)
                .populate('studentId', 'name email')
                .populate('subjectId', 'name')
        ]);

        // Calculate overall attendance percentage
        const attendanceStats = await Attendance.aggregate([
            {
                $group: {
                    _id: null,
                    present: {
                        $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
                    },
                    total: { $sum: 1 }
                }
            }
        ]);

        const overallPercentage = attendanceStats.length > 0 
            ? (attendanceStats[0].present / attendanceStats[0].total) * 100 
            : 0;

        res.status(200).json({
            success: true,
            data: {
                counts: {
                    students: studentCount,
                    courses: courseCount,
                    subjects: subjectCount,
                    attendance: attendanceCount
                },
                overallPercentage: Math.round(overallPercentage * 10) / 10,
                recentStudents,
                recentAttendance
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get Student Dashboard Stats
// @route   GET /api/dashboard/student
// @access  Private/Student
exports.getStudentStats = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id })
            .populate('courseId', 'name description code duration');
        
        if (!student) {
            return res.status(404).json({ success: false, error: 'Student profile not found' });
        }
        
        // Use existing logic for attendance summary
        // But we can aggregate it here for one single call
        const summary = await Attendance.aggregate([
            { $match: { studentId: student._id } },
            {
                $group: {
                    _id: null,
                    present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
                    total: { $sum: 1 }
                }
            }
        ]);

        const overallAttendance = summary.length > 0 ? (summary[0].present / summary[0].total) * 100 : 0;

        res.status(200).json({
            success: true,
            data: {
                student,
                overallAttendance: Math.round(overallAttendance * 10) / 10
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
