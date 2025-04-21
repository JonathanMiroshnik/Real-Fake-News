"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const llmRoutes_1 = __importDefault(require("./routes/llmRoutes"));
const mongoose_1 = __importDefault(require("mongoose"));
// Initialize express application
const app = (0, express_1.default)();
mongoose_1.default.connection.on('connected', () => {
    console.log(`Connected to ${mongoose_1.default.connection.host}:${mongoose_1.default.connection.port}/${mongoose_1.default.connection.name}`);
});
// Middleware pipeline
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
// API Routes
app.use('/api/llm', llmRoutes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});
// 404 Handler
app.use('/', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found'
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`💥 Critical error: ${err.message}`);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map