import path from 'path';
import fs from 'fs';
import { Router, Request, Response } from 'express';
import {
  compressImageInBackground,
  getCompressedImagePath,
  getOriginalImagePath,
} from '../utils/imageCompression.js';

// Import sub-routes
// import gameIntelligenceRoutes from '../lib/TicTacToeGameBackend/routes/gameIntelligenceRoutes.js'
// import llmRoutes from './llmRoutes.js';
import triviaRoutes from '../lib/TriviaGameBackend/routes/triviaRoutes.js';
import blogRoutes from './blogRoutes.js';
import slopMeterRoutes from './slopMeterRoutes.js';
import adminRoutes from './adminRoutes.js';
import horoscopeRoutes from './horoscopeRoutes.js';
import recipeRoutes from './recipeRoutes.js';
import presenceRoutes from './presenceRoutes.js';
import generationRoutes from './generationRoutes.js';

const router = Router();

// Mount each sub-route under its respective path
// app.use('/intelligence', gameIntelligenceRoutes);
router.use('/trivia', triviaRoutes);

// API Routes TODO: this route does not need to be open beyond the back end
// app.use('/llm', llmRoutes);

// Getting daily news
router.use('/blogs', blogRoutes);

// Horoscope routes
router.use('/horoscopes', horoscopeRoutes);

// Recipe routes
router.use('/recipes', recipeRoutes);

// Read-only writer-pipeline status for the client's "Slop meter" (header widget)
router.use('/slop-meter', slopMeterRoutes);

// Live presence for the header indicator (who is connected right now)
router.use('/presence', presenceRoutes);

// Read-only generation status (is a producer working on the next edition?)
router.use('/generation', generationRoutes);

// Admin routes (password protected)
router.use('/admin', adminRoutes);

// Health check endpoint
// Deliberately carries nothing but liveness: it is unauthenticated and public
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// TODO: 11 Nov 26 - Is there a more streamlined way of getting assets which doesn't pass through node?
// or at least, that fully exploits how backends should work, so caching on all levels, and here
// some already made way to send assets - not only images. Feels like there should be some well known middleware of some kind for it.
router.get('/images/:filename', (req, res) => {
  const sanitized = path.basename(req.params.filename);

  // Set CORP headers
  res.set({
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
    'Access-Control-Allow-Origin': process.env.CLIENT_URL,
    // Cache headers for better performance
    'Cache-Control': 'public, max-age=31536000, immutable',
  });

  // Get paths for compressed and original images
  const compressedPath = getCompressedImagePath(sanitized);
  const originalPath = getOriginalImagePath(sanitized);

  // Check if compressed version exists
  if (fs.existsSync(compressedPath)) {
    // Serve compressed version
    res.sendFile(compressedPath);
  } else if (fs.existsSync(originalPath)) {
    // Original exists but compressed doesn't - serve original immediately
    // and trigger background compression
    res.sendFile(originalPath);

    // Start background compression (non-blocking, fire-and-forget)
    compressImageInBackground(sanitized, originalPath);
  } else {
    // Neither exists - return 404
    res.status(404).json({ error: 'Image not found' });
  }
});

export default router;
