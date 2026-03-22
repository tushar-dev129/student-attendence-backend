const express = require('express');
const router = express.Router();
const { getAdminStats, getStudentStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/admin', protect, authorize('admin', 'professor'), getAdminStats);
router.get('/student', protect, getStudentStats);

module.exports = router;
