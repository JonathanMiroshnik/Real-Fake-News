import { defineConfig } from 'vitest/config';

/**
 * ═══════════════════════════════════════════════════════════════════
 * VITEST CONFIGURATION — Server
 * ═══════════════════════════════════════════════════════════════════
 *
 * 🔴 IMPORTANT: Vitest is architecturally coupled to Vite as a
 *    transform engine (Vite is a hard dependency of Vitest).
 *    However, this config is intentionally kept STANDALONE from
 *    any build tool configuration.
 *
 * 💡 If the project ever switches to a different build tool
 *    (Webpack, Turbopack, Rspack, etc.), this file should:
 *    1. Be KEPT as-is — it will continue to work independently
 *    2. NOT be merged with or replaced by the new build tool's config
 *    3. Be explicitly excluded from any build-tool migration scripts
 *
 * 🏗️ The test transform pipeline (Vite) is separate from the
 *    production build pipeline. This is normal — the same applies
 *    to Jest (which uses its own transform pipeline regardless of
 *    the build tool). Keeping them separate is intentional.
 *
 * ═══════════════════════════════════════════════════════════════════
 */
export default defineConfig({
  test: {
    // Node environment — we're testing a backend Express app
    environment: 'node',

    // Test file patterns
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],

    // Exclude build output and dependencies
    exclude: ['node_modules', 'dist'],

    // Timeout per test (default: 5000ms)
    testTimeout: 10_000,

    // Hook timeout (beforeAll, etc.)
    hookTimeout: 15_000,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/*.d.ts',
        'src/config/constants.js', // Legacy JS file
        'src/**/README.md',
      ],
      // Fail if coverage drops below these thresholds
      thresholds: {
        statements: 40,
        branches: 30,
        functions: 35,
        lines: 40,
      },
    },

    // Global test utilities available without imports
    globals: true,

    // Restore mocks between tests automatically
    restoreMocks: true,

    // Clear mocks between tests
    clearMocks: true,

    // Show verbose diff on failure
    // Note: diff accepts a string path to a custom diff config module, not a verbosity flag
    // Retry flaky tests
    retry: 0,
  },
});
