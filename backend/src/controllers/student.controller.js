/**
 * src/controllers/student.controller.js
 * -----------------------------------------
 * HTTP-facing orchestration layer: reads the request, calls the model
 * for data access, and shapes the HTTP response. Contains NO raw SQL
 * (see models/student.model.js) and NO validation rules (see
 * validators/student.validator.js) — its only job is coordinating
 * the two and translating the result into an HTTP status + ApiResponse.
 */

const studentModel = require('../models/student.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/students
 * Creates a new student record.
 */
const createStudent = asyncHandler(async (req, res) => {
  const { fullName, email, phone, course, enrollmentDate } = req.body;

  const existing = await studentModel.findByEmail(email);
  if (existing) {
    // 409 Conflict is the correct status for "resource already exists",
    // distinct from 400 (malformed request) — an API consumer can
    // branch on this specific code to show "already registered" rather
    // than a generic validation error.
    throw new ApiError(409, `A student with email "${email}" is already registered.`);
  }

  const student = await studentModel.create({ fullName, email, phone, course, enrollmentDate });
  return res.status(201).json(new ApiResponse(201, 'Student registered successfully.', student));
});

/**
 * GET /api/students/:id
 * Fetches a single student by id.
 */
const getStudentById = asyncHandler(async (req, res) => {
  const student = await studentModel.findById(Number(req.params.id));
  if (!student) {
    throw new ApiError(404, `No student found with id ${req.params.id}.`);
  }
  return res.status(200).json(new ApiResponse(200, 'Student retrieved successfully.', student));
});

/**
 * GET /api/students
 * Lists students with pagination, optional course filter, and search.
 */
const listStudents = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const { rows, total } = await studentModel.findAll({
    page,
    limit,
    course: req.query.course,
    search: req.query.search,
  });

  return res.status(200).json(
    new ApiResponse(200, 'Students retrieved successfully.', {
      students: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  );
});

/**
 * PATCH /api/students/:id
 * Partially updates a student.
 */
const updateStudent = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existing = await studentModel.findById(id);
  if (!existing) {
    throw new ApiError(404, `No student found with id ${id}.`);
  }

  if (Object.keys(req.body).length === 0) {
    throw new ApiError(400, 'At least one field must be provided to update.');
  }

  // If the email is being changed, re-check uniqueness against every
  // OTHER row (excluding this student's own current record).
  if (req.body.email && req.body.email !== existing.email) {
    const emailOwner = await studentModel.findByEmail(req.body.email);
    if (emailOwner) {
      throw new ApiError(409, `A student with email "${req.body.email}" is already registered.`);
    }
  }

  const updated = await studentModel.update(id, req.body);
  return res.status(200).json(new ApiResponse(200, 'Student updated successfully.', updated));
});

/**
 * DELETE /api/students/:id
 * Removes a student record.
 */
const deleteStudent = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const deleted = await studentModel.remove(id);
  if (!deleted) {
    throw new ApiError(404, `No student found with id ${id}.`);
  }
  return res.status(200).json(new ApiResponse(200, 'Student deleted successfully.', { id }));
});

module.exports = { createStudent, getStudentById, listStudents, updateStudent, deleteStudent };
