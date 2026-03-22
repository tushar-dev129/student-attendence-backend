const express = require('express');
const router = express.Router();
const {
    getProfessors,
    getProfessor,
    createProfessor,
    updateProfessor,
    deleteProfessor
} = require('../controllers/professorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router
    .route('/')
    .get(getProfessors)
    .post(createProfessor);

router
    .route('/:id')
    .get(getProfessor)
    .put(updateProfessor)
    .delete(deleteProfessor);

module.exports = router;
