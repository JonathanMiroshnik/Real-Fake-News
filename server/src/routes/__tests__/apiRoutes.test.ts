import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import apiRoutes from '../apiRoutes.js';

/**
 * Creates a lightweight Express app with just the API routes mounted.
 * This avoids needing full app initialization (DB, schema, scheduled jobs).
 */
function createTestApp(): express.Express {
  const app = express();
  app.use(express.json());
  app.use('/api', apiRoutes);
  return app;
}

describe('API Routes (integration)', () => {
  let app: express.Express;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /api/health', () => {
    it('should return 200 with status ok', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });

    it('should include a timestamp in the response', async () => {
      const response = await request(app).get('/api/health');
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
    });
  });

  describe('GET /api/images/:filename', () => {
    it('should return 404 for non-existent images', async () => {
      const response = await request(app).get('/api/images/non-existent-image.jpg');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Image not found');
    });

    it('should sanitize filenames to prevent path traversal', async () => {
      const response = await request(app).get('/api/images/../../../etc/passwd');
      // Should not serve system files — either 404 on the sanitized name or 404 on not found
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/blogs/relevant', () => {
    it('should return 200 (the controller handles empty state gracefully)', async () => {
      const response = await request(app).get('/api/blogs/relevant');
      // The controller catches errors and returns { success, articles, error }
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('articles');
    });
  });

  describe('GET /api/blogs/featured', () => {
    it('should return 200 when called without parameters', async () => {
      const response = await request(app).get('/api/blogs/featured');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('404 handler (via Express fallback)', () => {
    // The 404 handler is registered in app.ts, not in apiRoutes.ts.
    // apiRoutes only returns 404 for known paths like /api/images/:filename
    // when the image is not found. Unknown routes fall through Express
    // with an empty response body unless a catch-all is registered.
    it('should return 404 when a known route receives an invalid sub-path', async () => {
      const response = await request(app).get('/api/images/non-existent-image.jpg');
      expect(response.status).toBe(404);
    });

    it('should handle requests to unmounted sub-routes gracefully (empty body is acceptable)', async () => {
      const response = await request(app).get('/api/nonexistent-route');
      // apiRoutes doesn't have a catch-all, so Express returns 404 with default empty body
      expect(response.status).toBe(404);
    });
  });
});
