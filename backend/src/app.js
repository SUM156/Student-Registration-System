/**
 * src/app.js
 * ------------
 * Builds and configures the Express `app` object, but deliberately does
 * NOT call `app.listen()` here. Separating "build the app" from "start
 * listening on a port" is what lets tests/student.test.js import this
 * same `app` and drive it with supertest WITHOUT binding a real network
 * port for every test run (see server.js for the actual listen() call).
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const routes = require('./routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// --- Security headers ---
// helmet sets a battle-tested set of HTTP security headers (X-Content-
// Type-Options, X-Frame-Options, etc.) that are easy to forget by hand.
app.use(helmet());

// --- CORS ---
// Restricts which frontend origins may call this API. Wide-open CORS
// ("*") is convenient in a tutorial but a real information-exposure
// risk for an API that will hold personal data (student emails/phones).
app.use(
  cors({
    origin: env.cors.allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  })
);

// --- Rate limiting ---
// A basic brute-force / scraping guard on the whole API surface.
app.use(
  rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again later.' },
  })
);

// --- Request logging ---
// 'dev' format is concise and colorized for local development; a real
// production deployment would swap this for a structured JSON format
// piped to a log aggregator (see docs/ARCHITECTURE.md "Future Roadmap").
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// --- Body parsing ---
app.use(express.json({ limit: '10kb' })); // small limit: this API never expects large payloads
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use('/api', routes);

// --- 404 + centralized error handling (ORDER MATTERS: always last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
