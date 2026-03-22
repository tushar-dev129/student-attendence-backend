const express = require('express');
const router = express.Router();
const { 
    createNotification, 
    getNotifications, 
    getAdminNotifications,
    deleteNotification
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin'), createNotification);
router.get('/', protect, getNotifications);
router.get('/admin', protect, authorize('admin'), getAdminNotifications);
router.delete('/:id', protect, authorize('admin'), deleteNotification);

module.exports = router;
