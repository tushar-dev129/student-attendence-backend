const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const mongoose = require('mongoose');

// @desc    Mark attendance (Bulk)
// @route   POST /api/attendance/mark
// @access  Private/Admin
exports.markAttendance = async (req, res) => {
    const { courseId, subjectId, date, students } = req.body;

    if (!courseId || !subjectId || !date || !students || !Array.isArray(students)) {
        return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    try {
        const attendanceRecords = students.map(s => ({
            studentId: s.studentId,
            courseId,
            subjectId,
            date: new Date(date),
            status: s.status,
            markedBy: req.user._id
        }));

        // Using bulkWrite for better performance and handling duplicates
        const ops = attendanceRecords.map(record => ({
            updateOne: {
                filter: { 
                    studentId: record.studentId, 
                    subjectId: record.subjectId, 
                    date: record.date 
                },
                update: { $set: record },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(ops);

        res.status(200).json({ success: true, message: 'Attendance marked successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get all attendance records (Admin)
// @route   GET /api/attendance
// @access  Private/Admin
exports.getAttendance = async (req, res) => {
    const { courseId, subjectId, date } = req.query;
    let query = {};

    if (courseId) query.courseId = courseId;
    if (subjectId) query.subjectId = subjectId;
    if (date) {
        const d = new Date(date);
        const start = new Date(d.setHours(0, 0, 0, 0));
        const end = new Date(d.setHours(23, 59, 59, 999));
        query.date = { $gte: start, $lte: end };
    }

    try {
        const attendance = await Attendance.find(query)
            .populate('studentId', 'name email')
            .populate('courseId', 'name')
            .populate('subjectId', 'name')
            .sort({ date: -1 });

        res.status(200).json({ success: true, count: attendance.length, data: attendance });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get student attendance records
// @route   GET /api/attendance/student/:id
// @access  Private (Admin or Student)
exports.getStudentAttendance = async (req, res) => {
    try {
        // Validate student existence
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }

        // Authorization check
        if (req.user.role !== 'admin' && req.user._id.toString() !== student.userId.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const attendance = await Attendance.find({ studentId: req.params.id })
            .populate('subjectId', 'name')
            .populate('courseId', 'name')
            .sort({ date: -1 });

        res.status(200).json({ success: true, count: attendance.length, data: attendance });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get attendance summary (Percentage)
// @route   GET /api/attendance/summary/:studentId
// @access  Private (Admin or Student)
exports.getAttendanceSummary = async (req, res) => {
    try {
        const studentId = new mongoose.Types.ObjectId(req.params.studentId);
        
        const summary = await Attendance.aggregate([
            { $match: { studentId } },
            {
                $group: {
                    _id: '$subjectId',
                    totalClasses: { $sum: 1 },
                    present: {
                        $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
                    },
                    absent: {
                        $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: 'subjects',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'subjectInfo'
                }
            },
            { $unwind: '$subjectInfo' },
            {
                $project: {
                    subject: '$subjectInfo.name',
                    totalClasses: 1,
                    present: 1,
                    absent: 1,
                    percentage: {
                        $multiply: [{ $divide: ['$present', '$totalClasses'] }, 100]
                    }
                }
            }
        ]);

        // Calculate overall percentage
        let overallTotal = 0;
        let overallPresent = 0;
        summary.forEach(s => {
            overallTotal += s.totalClasses;
            overallPresent += s.present;
        });

        const overallPercentage = overallTotal > 0 ? (overallPresent / overallTotal) * 100 : 0;

        res.status(200).json({
            success: true,
            data: {
                subjectWise: summary,
                overall: {
                    totalClasses: overallTotal,
                    present: overallPresent,
                    absent: overallTotal - overallPresent,
                    percentage: overallPercentage
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
