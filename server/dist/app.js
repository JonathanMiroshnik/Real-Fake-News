"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
// import rateLimit from 'express-rate-limit';
// import mongoose from 'mongoose';
// import llmRoutes from './routes/llmRoutes';
const blogRoutes_1 = __importDefault(require("./routes/blogRoutes"));
const blogWriting_1 = require("./jobs/blogWriting");
const blogController_1 = require("./controllers/blogController");
// TODO: change express use to get set etc?
// Initialize express application
const app = (0, express_1.default)();
// Middleware pipeline
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
// API Routes TODO: this route does not need to be open beyond the back end
// app.use('/api/llm', llmRoutes);
// Getting daily news
app.use('/api/blogs', blogRoutes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});
// TODO: this is UNSAFE, exchange to rate limited and auth needed to get images?
// // Dedicated image API endpoint
// app.get('/api/images/:filename', (req, res) => {
//   const sanitized = path.basename(req.params.filename);
//   res.sendFile(path.join(__dirname, '../data/images', sanitized));
// });
app.get('/api/images/:filename', (req, res) => {
    const sanitized = path_1.default.basename(req.params.filename);
    // Set CORP headers
    res.set({
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
        'Access-Control-Allow-Origin': process.env.CLIENT_URL
    });
    res.sendFile(path_1.default.join(__dirname, '../data/images', sanitized));
});
// Apply CORS specifically to image routes
app.use('/api/images', (0, cors_1.default)({
    origin: "http://localhost:5173",
    exposedHeaders: ['Content-Type', 'Content-Length']
}));
// ---------------------------------------------------------------------------------
// server/src/middleware/auth.ts:
// export const validateImageRequest = (req, res, next) => {
//   const validExtensions = ['.png', '.jpg', '.jpeg'];
//   const filename = path.parse(req.params[0]);
//   if (!validExtensions.includes(filename.ext.toLowerCase())) {
//     return res.status(403).send('Invalid file type');
//   }
//   if (filename.dir.includes('..')) {
//     return res.status(403).send('Path traversal detected');
//   }
//   next();
// };
// app.use('/images', 
//   rateLimit({ windowMs: 15*60*1000, max: 100 }), // 100 requests/15min
//   validateImageRequest,
//   express.static(imagePath, {
//     dotfiles: 'ignore',
//     setHeaders: (res) => {
//       res.set('X-Content-Type-Options', 'nosniff');
//     }
//   })
// );
// ---------------------------------------------------------------------------------
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
// Recurring code jobs
(0, blogWriting_1.blogWritingManager)(blogController_1.DAY_MILLISECS);
exports.default = app;
//# sourceMappingURL=app.js.map