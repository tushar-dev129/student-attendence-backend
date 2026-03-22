const express = require('express');
const router = express.Router();
const { 
    markAttendance, 
    getAttendance, 
    getStudentAttendance, 
    getAttendanceSummary 
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/mark', authorize('professor'), markAttendance);
router.get('/', authorize('admin', 'professor'), getAttendance);
router.get('/student/:id', getStudentAttendance);
router.get('/summary/:studentId', getAttendanceSummary);

module.exports = router;
