/**
 * src/validators/student.validator.js
 * --------------------------------------
 * Declarative validation rule chains, one per endpoint. Kept separate
 * from controllers so the *rules* (what makes a valid student record)
 * are reviewable and testable independently of the *handling logic*
 * (what to do with a valid one) — a controller should never need to
 * know HOW a field was validated, only THAT it was.
 */

const { body, param, query } = require('express-validator');

// Shared field-level rules, reused by both create and update chains so
// the two can never silently drift out of sync with each other.
const fullNameRule = body('fullName')
  .trim()
  .notEmpty()
  .withMessage('Full name is required.')
  .isLength({ min: 2, max: 120 })
  .withMessage('Full name must be between 2 and 120 characters.');

const emailRule = body('email')
  .trim()
  .notEmpty()
  .withMessage('Email is required.')
  .isEmail()
  .withMessage('A valid email address is required.')
  .isLength({ max: 160 })
  .withMessage('Email must be at most 160 characters.')
  .normalizeEmail();

const phoneRule = body('phone')
  .trim()
  .notEmpty()
  .withMessage('Phone number is required.')
  // Accepts formats like +92-300-1234567, +923001234567, 0300-1234567.
  .matches(/^\+?[0-9\-\s]{7,20}$/)
  .withMessage('Phone number must be 7-20 digits, optionally with +, -, or spaces.');

const courseRule = body('course')
  .trim()
  .notEmpty()
  .withMessage('Course is required.')
  .isLength({ min: 2, max: 100 })
  .withMessage('Course must be between 2 and 100 characters.');

const enrollmentDateRule = body('enrollmentDate')
  .notEmpty()
  .withMessage('Enrollment date is required.')
  .isISO8601()
  .withMessage('Enrollment date must be a valid date (YYYY-MM-DD).')
  .custom((value) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(value) > today) {
      throw new Error('Enrollment date cannot be in the future.');
    }
    return true;
  });

const idParamRule = param('id').isInt({ min: 1 }).withMessage('Student id must be a positive integer.');

const createStudentRules = [fullNameRule, emailRule, phoneRule, courseRule, enrollmentDateRule];

// Update allows partial payloads (PATCH semantics) — each field is
// optional, but IF present must still satisfy the same constraints.
const updateStudentRules = [
  idParamRule,
  fullNameRule.optional(),
  emailRule.optional(),
  phoneRule.optional(),
  courseRule.optional(),
  enrollmentDateRule.optional(),
];

const getStudentByIdRules = [idParamRule];
const deleteStudentRules = [idParamRule];

const listStudentsQueryRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100.'),
  query('course').optional().trim().isLength({ max: 100 }),
  query('search').optional().trim().isLength({ max: 160 }),
];

module.exports = {
  createStudentRules,
  updateStudentRules,
  getStudentByIdRules,
  deleteStudentRules,
  listStudentsQueryRules,
};
