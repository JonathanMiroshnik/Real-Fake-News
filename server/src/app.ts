import express, { Request, Response, NextFunction } from 'express';
// import rateLimit from 'express-rate-limit';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import apiRoutes from './routes/apiRoutes.js';
import { initializeScheduledJobs } from './jobs/scheduler.js';
import { initializeSchema } from './lib/database/schema.js';
import { getDatabase } from './lib/database/database.js';

// TODO: change express use to get set etc?

// Initialize express application
const app = express();

// Initialize SQLite database schema
initializeSchema();
getDatabase(); // Establish connection

// Activating the recurring jobs
initializeScheduledJobs();

// Middleware pipeline
app.use(cors({
  origin: [
    "https://real.sensorcensor.xyz", 
    "http://localhost:5173", 
    "http://localhost:5174", // Admin panel (dev)
    "http://162.0.237.138:5174", // Admin panel (production - IP access)
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Main backend routes
// Always use /api prefix in production, only use / for local dev when explicitly set
let PREFIX: string = "/api";
if (process.env.LOCAL_DEV_BACKEND === "true") {
  // Only use root path if explicitly set to "true" for local development
  PREFIX = "/";
}

app.use(PREFIX, apiRoutes);

// 404 Handler

// Do NOT use '*', instead:
//  https://stackoverflow.com/questions/78973586/typeerror-invalid-token-at-1-https-git-new-pathtoregexperror
app.use(/(.*)/, (req: Request, res: Response) => {
  // Ensure CORS headers are set even for 404 responses
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://real.sensorcensor.xyz", 
    "http://localhost:5173", 
    "http://localhost:5174",
    "http://162.0.237.138:5174", // Admin panel (production - IP access)
    "http://localhost:3000"
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`💥 Critical error: ${err.message}`);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;