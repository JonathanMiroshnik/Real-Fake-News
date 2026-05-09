import { test, expect } from '@playwright/test';

/**
 * E2E: Backend API
 * Tests that the Express API endpoints respond correctly.
 * These tests hit the API directly (not through the frontend).
 */
test.describe('API Health & Routes', () => {
  const API_BASE = process.env.CI
    ? 'http://server:5001/api'
    : 'http://localhost:5001/api';

  test('health endpoint should return 200', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('status', 'ok');
  });

  test('health endpoint should include ISO timestamp', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);
    const body = await response.json();
    expect(body).toHaveProperty('timestamp');
    // Verify it's a valid ISO date string
    expect(() => new Date(body.timestamp)).not.toThrow();
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });

  test('blogs/relevant should return articles', async ({ request }) => {
    const response = await request.get(`${API_BASE}/blogs/relevant`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('success');
    expect(body).toHaveProperty('articles');
    expect(Array.isArray(body.articles)).toBeTruthy();
  });

  test('blogs/featured should respond', async ({ request }) => {
    const response = await request.get(`${API_BASE}/blogs/featured`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('success');
  });

  test('unknown endpoints should return 404', async ({ request }) => {
    const response = await request.get(`${API_BASE}/nonexistent-route`);
    expect(response.status()).toBe(404);
  });
});
