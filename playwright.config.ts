import { defineConfig, devices } from '@playwright/test';

/**
 * ═══════════════════════════════════════════════════════════════════
 * PLAYWRIGHT CONFIGURATION — End-to-End Tests
 * ═══════════════════════════════════════════════════════════════════
 *
 * These tests run against the real application.
 * Start the server and client before running: docker compose up
 * Or for development: npm run dev in both server/ and client/
 *
 * ═══════════════════════════════════════════════════════════════════
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'cd server && npm run dev',
      url: 'http://localhost:5001/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: 'cd client && npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
