import express, { Request, Response, NextFunction } from 'express';
// import rateLimit from 'express-rate-limit';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import apiRoutes from './routes/apiRoutes.js';
import { initializeScheduledJobs } from './jobs/scheduler.js';

// TODO: change express use to get set etc?

// Initialize express application
const app = express();

// Activating the recurring jobs
initializeScheduledJobs();

// Middleware pipeline
app.use(cors({
  origin: ["https://real.sensorcensor.xyz", "http://localhost:5173"],
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Main backend routes
let PREFIX: string = "";
if (process.env.LOCAL_DEV_BACKEND === undefined) {
  PREFIX = '/api';
}
else {
  PREFIX = process.env.LOCAL_DEV_BACKEND === "true" ? '/api': "/";
}

app.use(PREFIX, apiRoutes);

// 404 Handler

// Do NOT use '*', instead:
//  https://stackoverflow.com/questions/78973586/typeerror-invalid-token-at-1-https-git-new-pathtoregexperror
app.use(/(.*)/, (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found'
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