/**
 * src/config/database.js
 * -----------------------
 * Creates a single, shared MySQL connection POOL for the whole app.
 *
 * Why a pool, not a single connection:
 * A single `mysql.createConnection()` serves one query at a time; under
 * concurrent requests, later requests queue up behind earlier ones on
 * the same TCP connection. A pool (`mysql.createPool()`) maintains a
 * small set of reusable connections and hands one to whichever request
 * needs it, releasing it back when the query finishes — this is the
 * standard pattern for a Node.js API talking to MySQL under real load.
 *
 * Why mysql2/promise, not the callback-style `mysql` package:
 * Promise-based queries let every controller use `async/await` directly
 * instead of nesting callbacks, which is both more readable and lets
 * errors propagate naturally to Express's error-handling middleware via
 * a simple `try/catch` + `next(err)` (see utils/asyncHandler.js).
 */

const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: env.db.connectionLimit,
  queueLimit: 0,
  // Return JS Date objects as ISO date strings (YYYY-MM-DD) for DATE
  // columns instead of a full JS Date object in local server timezone —
  // avoids a whole class of timezone-shift bugs in date-only fields.
  dateStrings: ['DATE'],
});

/**
 * Verifies the pool can actually reach the database. Called once at
 * server startup (see server.js) so a misconfigured DB_HOST fails the
 * deployment immediately instead of surfacing as a 500 on the first
 * real request a user makes.
 */
async function verifyDatabaseConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    // Always release back to the pool, even if ping() throws — an
    // un-released connection under an error path is a classic pool-
    // exhaustion bug that only shows up after N failed startups.
    connection.release();
  }
}

module.exports = { pool, verifyDatabaseConnection };
