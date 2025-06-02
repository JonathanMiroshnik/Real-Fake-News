"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const app_js_1 = __importDefault(require("./app.js"));
// Load environment variables
(0, dotenv_1.config)({ path: (0, path_1.resolve)(__dirname, '../.env') });
// Configuration constants
const PORT = process.env.PORT || 5001;
// Server startup sequence
const startServer = async () => {
    try {
        const server = app_js_1.default.listen(PORT, () => {
            console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
            console.log(`🔗 http://localhost:${PORT}`);
        });
        // Graceful shutdown
        const shutdown = async (signal) => {
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
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
// Start application
startServer();
//# sourceMappingURL=index.js.map