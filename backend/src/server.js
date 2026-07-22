/**
 * src/server.js
 * ---------------
 * The actual process entrypoint (`npm start` runs this file). Verifies
 * the database is reachable BEFORE binding the HTTP port, so a
 * misconfigured DB_HOST fails the deployment immediately and visibly,
 * instead of starting a server that returns 500s on every real request.
 */

const app = require('./app');
const env = require('./config/env');
const { verifyDatabaseConnection } = require('./config/database');

async function startServer() {
  try {
    await verifyDatabaseConnection();
    // eslint-disable-next-line no-console
    console.log('✅ Database connection verified.');

    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Server running in ${env.nodeEnv} mode on http://localhost:${env.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

// Surface truly unexpected errors instead of letting the process hang
// in an unknown state — a container orchestrator (Docker/Render) will
// then restart the process cleanly per its restart policy.
process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled promise rejection:', reason);
  process.exit(1);
});
