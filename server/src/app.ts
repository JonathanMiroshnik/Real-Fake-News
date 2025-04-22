import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import llmRoutes from './routes/llmRoutes';
import { Request, Response, NextFunction } from 'express';
// import mongoose from 'mongoose';

// import crudTest from './lowdb_complete/lowdb_lib/lowdb_crud'
// crudTest();

import { articleTest } from './schemes/article';
articleTest();


// Initialize express application
const app = express();

// Middleware pipeline
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api/llm', llmRoutes);

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

export default app;