const express = require('express');
const {
    createStudent,
    getStudents,
    getStudent,
    updateStudent,
    deleteStudent
} = require('../controllers/studentController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
    .route('/')
    .get(authorize('admin', 'professor'), getStudents)
    .post(authorize('admin'), createStudent);

router
    .route('/:id')
    .get(getStudent)
    .put(authorize('admin'), updateStudent)
    .delete(authorize('admin'), deleteStudent);

module.exports = router;
