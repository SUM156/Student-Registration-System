/**
 * src/middlewares/validateRequest.js
 * ------------------------------------
 * Runs after an express-validator rule chain (see validators/student.validator.js)
 * has attached any validation errors to the request. If there are any,
 * this middleware short-circuits the request with a single, consistent
 * 400 ApiError carrying every field error — controllers never see an
 * invalid request body at all, so they don't need to re-check types or
 * ranges themselves.
 */

const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const details = errors.array().map((error) => ({
    field: error.path,
    message: error.msg,
  }));

  return next(new ApiError(400, 'Validation failed. Please check the highlighted fields.', details));
}

module.exports = validateRequest;
