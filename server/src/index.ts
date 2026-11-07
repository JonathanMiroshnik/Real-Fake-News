// Side-effect import: must stay first so server/.env is loaded before app.ts
// (and everything it imports) reads process.env.
import './config/env.js';
import app from './app.js';
import { closeDatabase } from './lib/database/database.js';

// Configuration constants
const PORT = process.env.PORT || 5001;

// Server startup sequence
const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`🔗 http://localhost:${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`🛑 Received ${signal}, shutting down gracefully...`);
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
