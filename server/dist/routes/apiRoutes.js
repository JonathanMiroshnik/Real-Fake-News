"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = require("express");
// Import sub-routes
// import gameIntelligenceRoutes from '../lib/TicTacToeGameBackend/routes/gameIntelligenceRoutes.js'
// import llmRoutes from './llmRoutes.js';
const triviaRoutes_js_1 = __importDefault(require("../lib/TriviaGameBackend/routes/triviaRoutes.js"));
const blogRoutes_js_1 = __importDefault(require("./blogRoutes.js"));
// import authRoutes from "./auth.js";
const router = (0, express_1.Router)();
// Mount each sub-route under its respective path
// app.use('/intelligence', gameIntelligenceRoutes);
router.use('/trivia', triviaRoutes_js_1.default);
// API Routes TODO: this route does not need to be open beyond the back end
// app.use('/llm', llmRoutes);
// Getting daily news
router.use('/blogs', blogRoutes_js_1.default);
// TODO: auth test
// router.use('/auth', authRoutes);
// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});
router.get('/images/:filename', (req, res) => {
    const sanitized = path_1.default.basename(req.params.filename);
    // Set CORP headers
    res.set({
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
        'Access-Control-Allow-Origin': process.env.CLIENT_URL
    });
    res.sendFile(path_1.default.join(__dirname, '../../data/images', sanitized));
});
exports.default = router;
// TODO: this is UNSAFE, exchange to rate limited and auth needed to get images?
// // Dedicated image API endpoint
// app.get('/api/images/:filename', (req, res) => {
//   const sanitized = path.basename(req.params.filename);
//   res.sendFile(path.join(__dirname, '../data/images', sanitized));
// });
// // Apply CORS specifically to image routes
// router.use('/images', cors({
//   origin: ["https://real.sensorcensor.xyz", "http://localhost:5173"],
//   exposedHeaders: ['Content-Type', 'Content-Length']
// }));
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
//# sourceMappingURL=apiRoutes.js.map