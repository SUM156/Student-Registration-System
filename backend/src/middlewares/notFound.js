/**
 * src/middlewares/notFound.js
 * -----------------------------
 * Registered AFTER all real routes but BEFORE errorHandler. If a
 * request reaches this point, no route matched it — converts that into
 * a proper ApiError(404) so it flows through the same error-formatting
 * path as every other error, instead of Express's default HTML 404 page.
 */

const ApiError = require('../utils/ApiError');

function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = notFound;
