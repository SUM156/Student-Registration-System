/**
 * src/middlewares/errorHandler.js
 * ---------------------------------
 * Express identifies an error-handling middleware by its FOUR-argument
 * signature `(err, req, res, next)` — this must be registered LAST, in
 * app.js, after all routes, so any `next(err)` call (including the one
 * from asyncHandler.js) eventually lands here.
 *
 * This is the single place in the whole backend that decides what an
 * error response looks like — no controller ever hand-writes an error
 * JSON body, which is what guarantees every error response has the
 * same shape.
 */

const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational === true;

  // Unexpected (non-operational) errors are logged with full detail on
  // the server, but their internals are NEVER leaked to the client in
  // production — leaking a stack trace or SQL error string to an API
  // consumer is a real information-disclosure risk.
  if (!isOperational) {
    // eslint-disable-next-line no-console
    console.error('[UNEXPECTED ERROR]', err);
  }

  const responseBody = {
    success: false,
    message: isOperational ? err.message : 'An unexpected error occurred. Please try again later.',
    ...(err.details && err.details.length > 0 ? { details: err.details } : {}),
    // Stack traces are opt-in and ONLY ever included outside production,
    // to help local debugging without ever risking a production leak.
    ...(env.nodeEnv !== 'production' ? { stack: err.stack } : {}),
  };

  res.status(statusCode).json(responseBody);
}

module.exports = errorHandler;
