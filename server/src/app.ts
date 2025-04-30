import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
// import mongoose from 'mongoose';

import llmRoutes from './routes/llmRoutes';
import blogRoutes from './routes/blogRoutes'
import { blogWritingManager } from './jobs/blogWriting';
import { ONE_HOUR_MILLISECS } from './controllers/blogController';

// Initialize express application
const app = express();

// Middleware pipeline
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api/llm', llmRoutes);

// Getting daily blogs
app.use('/api/blogs', blogRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use('/', (req: Request, res: Response) => {
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

// Recurring code jobs
const TEN_MINUTES_MILLISECONDS = 10*60*1000;
blogWritingManager(ONE_HOUR_MILLISECS, TEN_MINUTES_MILLISECONDS);

export default app;