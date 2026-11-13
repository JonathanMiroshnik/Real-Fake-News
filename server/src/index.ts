// Side-effect import: must stay first so server/.env is loaded before app.ts
// (and everything it imports) reads process.env.
import './config/env.js';
import { checkContentSourceAtBoot, logMockRowCount } from './config/contentSourceGuard.js';
import { resolveDatabaseFile } from './config/paths.js';
import { closeDatabase } from './lib/database/database.js';
import { startScheduler, type SchedulerHandle } from './jobs/scheduler.js';

// Configuration constants
const PORT = process.env.PORT || 5001;

/**
 * Runs the content checks before the application is imported.
 *
 * `app.ts` initialises the schema and opens the database while it is being
 * imported, so importing it first would start a server on a database these checks
 * exist to reject. A refusal has to happen before any of that, which is why the
 * app is imported dynamically, after the await.
 *
 * @returns The application, ready to listen.
 */
async function loadCheckedApp() {
  const mockTally = await checkContentSourceAtBoot(resolveDatabaseFile());
  logMockRowCount(mockTally);

  const { default: app } = await import('./app.js');
  return app;
}

// Server startup sequence
const startServer = async () => {
  try {
    const app = await loadCheckedApp();
    // After the app is loaded: the schema exists and the database is open, so the
    // boot-time job runs have a table to write to.
    let stopScheduler: SchedulerHandle = startScheduler();
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`🔗 http://localhost:${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`🛑 Received ${signal}, shutting down gracefully...`);
      // First: nothing may start another job while the database is closing.
      stopScheduler();
      stopScheduler = () => undefined;
      server.close(async () => {
        closeDatabase(); // Close SQLite database connection
        console.log('💥 Process terminated');
        process.exit(0);
      });
    };

    // Process signal handlers
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Error handlers
    process.on('uncaughtException', (error) => {
      console.error('💣 Uncaught Exception:', error);
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('🔥 Unhandled Rejection at:', promise, 'Reason:', reason);
      shutdown('unhandledRejection');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start application
startServer();
