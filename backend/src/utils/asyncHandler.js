/**
 * src/utils/asyncHandler.js
 * --------------------------
 * Express does NOT automatically catch rejected promises thrown inside
 * an `async` route handler — an unhandled rejection there would crash
 * the process or hang the request. The conventional fix is wrapping
 * every async controller in a helper that catches the rejection and
 * forwards it to `next(err)`, which routes it into errorHandler.js.
 *
 * Without this, every single controller method would need its own
 * `try { ... } catch (err) { next(err) }` boilerplate — this wrapper
 * removes that repetition project-wide.
 *
 * Usage: router.get('/', asyncHandler(controller.listStudents));
 */
function asyncHandler(requestHandler) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
