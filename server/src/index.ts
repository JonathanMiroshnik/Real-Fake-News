import { config } from 'dotenv';
import { resolve } from 'path';
import app from './app.js';

// Load environment variables
config({ path: resolve(__dirname, '../.env') });

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