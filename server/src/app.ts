import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import path from 'path';
// import rateLimit from 'express-rate-limit';
// import mongoose from 'mongoose';

// import llmRoutes from './routes/llmRoutes';
import blogRoutes from './routes/blogRoutes.js'
import { blogWritingManager } from './jobs/blogWriting.js';
import { DAY_MILLISECS, ONE_HOUR_MILLISECS } from './controllers/blogController.js';

// TODO: change express use to get set etc?

// Initialize express application
const app = express();

// Middleware pipeline
app.use(cors({
  // origin: "http://localhost:5173",
  origin: "https://real.sensorcensor.xyz",
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes TODO: this route does not need to be open beyond the back end
// app.use('/api/llm', llmRoutes);

// Getting daily news
app.use('/api/blogs', blogRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
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
  const sanitized = path.basename(req.params.filename);
  
  // Set CORP headers
  res.set({
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
    'Access-Control-Allow-Origin': process.env.CLIENT_URL
  });
  
  res.sendFile(path.join(__dirname, '../data/images', sanitized));
});


// Apply CORS specifically to image routes
app.use('/api/images', cors({
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
blogWritingManager(DAY_MILLISECS); // DAY_MILLISECS ONE_HOUR_MILLISECS

export default app;