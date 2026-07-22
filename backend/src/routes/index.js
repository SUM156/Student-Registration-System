/**
 * src/routes/index.js
 * ---------------------
 * Single mounting point for every resource's router. Adding a new
 * resource (e.g. `courses`) later means creating courses.routes.js and
 * adding ONE line here — app.js never needs to know the full list of
 * resources directly.
 */

const express = require('express');
const studentRoutes = require('./student.routes');

const router = express.Router();

router.use('/students', studentRoutes);

// Lightweight liveness endpoint for uptime checks / container healthchecks.
router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy.', timestamp: new Date().toISOString() });
});

module.exports = router;
