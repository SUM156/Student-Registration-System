/**
 * src/utils/ApiError.js
 * ----------------------
 * A typed application error carrying an HTTP status code, so any
 * controller can `throw new ApiError(404, 'Student not found')` and the
 * central error-handling middleware (middlewares/errorHandler.js) knows
 * exactly what status/response shape to send — instead of every
 * controller manually calling `res.status(...).json(...)` and risking
 * an inconsistent error response shape across endpoints.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (404, 400, 409, etc.)
   * @param {string} message - Human-readable error message, safe to show to API consumers.
   * @param {object[]} [details] - Optional structured details (e.g. per-field validation errors).
   */
  constructor(statusCode, message, details = []) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // distinguishes "expected" errors from bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
