/**
 * src/config/env.js
 * ------------------
 * Loads and validates environment variables ONCE at startup.
 *
 * Why this file exists:
 * Reading `process.env.DB_HOST` directly all over the codebase means a
 * typo'd variable name silently becomes `undefined` deep inside a query,
 * and the app fails confusingly at request time instead of at startup.
 * This module fails FAST and LOUD if required config is missing, and
 * gives every other file a single typed object to import instead.
 */

require('dotenv').config();

/**
 * Required variables — the app should refuse to start without these.
 * @type {string[]}
 */
const REQUIRED_VARS = ['DB_HOST', 'DB_USER', 'DB_NAME'];

function assertRequiredVarsPresent() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    // Thrown at import time -> crashes the process immediately with a
    // clear message, rather than starting a broken server.
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
        'Copy backend/.env.example to backend/.env and fill these in.'
    );
  }
}

assertRequiredVarsPresent();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,

  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  },

  cors: {
    // Comma-separated list in .env, e.g. "http://localhost:5500,https://myapp.com"
    allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5500').split(','),
  },

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
};

module.exports = env;
