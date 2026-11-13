import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import apiRoutes from './routes/apiRoutes.js';
import { getAllowedOrigins } from './config/corsOrigins.js';
import { initializeSchema } from './lib/database/schema.js';
import { getDatabase } from './lib/database/database.js';

// TODO: change express use to get set etc?

// Initialize express application
const app = express();

// Trust the first upstream proxy (client nginx) for accurate client IP, protocol, and host.
// Without this, req.ip returns nginx's internal IP and req.protocol is always 'http'.
app.set('trust proxy', 1);

// Initialize SQLite database schema
initializeSchema();
getDatabase(); // Establish connection

// The background jobs are started by `index.ts`, after this module has been
// imported and the database is open — never here: anything that imports the app
// (every API test) used to start real timers as a side effect.

// Middleware pipeline
app.use(
  cors({
    origin: getAllowedOrigins(),
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'], // TODO: 11 Nov 26 - Am I supposed to add the new "QUERY" keyword?
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Main backend routes
// Always use /api prefix for consistency across dev and production
// This ensures all clients (admin, client, etc.) can use the same API paths
app.use('/api', apiRoutes);

// 404 Handler

// Do NOT use '*', instead:
//  https://stackoverflow.com/questions/78973586/typeerror-invalid-token-at-1-https-git-new-pathtoregexperror
app.use(/(.*)/, (req: Request, res: Response) => {
  // Ensure CORS headers are set even for 404 responses (same allowlist as cors())
  const origin = req.headers.origin;

  if (origin && getAllowedOrigins().includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(`💥 Critical error: ${err.message}`);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;
