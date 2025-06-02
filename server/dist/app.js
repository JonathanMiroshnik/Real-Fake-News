"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import rateLimit from 'express-rate-limit';
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const apiRoutes_js_1 = __importDefault(require("./routes/apiRoutes.js"));
const scheduler_js_1 = require("./jobs/scheduler.js");
// TODO: change express use to get set etc?
// Initialize express application
const app = (0, express_1.default)();
// Activating the recurring jobs
(0, scheduler_js_1.initializeScheduledJobs)();
// Middleware pipeline
app.use((0, cors_1.default)({
    origin: ["https://real.sensorcensor.xyz", "http://localhost:5173"],
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
// Main backend routes
let PREFIX = "";
if (process.env.LOCAL_DEV_BACKEND === undefined) {
    PREFIX = '/api';
}
else {
    PREFIX = process.env.LOCAL_DEV_BACKEND === "true" ? '/api' : "/";
}
app.use(PREFIX, apiRoutes_js_1.default);
// 404 Handler
// Do NOT use '*', instead:
//  https://stackoverflow.com/questions/78973586/typeerror-invalid-token-at-1-https-git-new-pathtoregexperror
app.use(/(.*)/, (req, res) => {
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