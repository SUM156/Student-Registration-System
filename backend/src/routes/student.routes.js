/**
 * src/routes/student.routes.js
 * -------------------------------
 * Maps HTTP verbs + paths to (validation chain -> validateRequest ->
 * controller). This file is intentionally "boring" — it contains no
 * logic of its own, only wiring — which is exactly what makes the full
 * set of available endpoints readable at a glance in one place.
 */

const express = require('express');
const controller = require('../controllers/student.controller');
const validateRequest = require('../middlewares/validateRequest');
const {
  createStudentRules,
  updateStudentRules,
  getStudentByIdRules,
  deleteStudentRules,
  listStudentsQueryRules,
} = require('../validators/student.validator');

const router = express.Router();

// REST resource: /api/students
router.post('/', createStudentRules, validateRequest, controller.createStudent);
router.get('/', listStudentsQueryRules, validateRequest, controller.listStudents);
router.get('/:id', getStudentByIdRules, validateRequest, controller.getStudentById);
router.patch('/:id', updateStudentRules, validateRequest, controller.updateStudent);
router.delete('/:id', deleteStudentRules, validateRequest, controller.deleteStudent);

module.exports = router;
