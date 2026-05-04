/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * ═══════════════════════════════════════════════════════════════════
 * VITEST CONFIGURATION — Client (React)
 * ═══════════════════════════════════════════════════════════════════
 *
 * 🔴 IMPORTANT: This config is intentionally STANDALONE from the
 *    build tool configuration (vite.config.ts). The build config
 *    uses a callback form that is incompatible with mergeConfig.
 *
 *    This config uses the same Vite plugins (react) for transform
 *    consistency, but is fully independent.
 *
 * 💡 If the project switches build tools in the future, keep this
 *    file as-is. It will continue to work independently because
 *    Vitest runs its own Vite transform pipeline separate from
 *    any production build tool.
 *
 * ═══════════════════════════════════════════════════════════════════
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/**/*.d.ts',
        'src/vite-env.d.ts',
        'src/main.tsx',
      ],
    },
    css: false,
  },
});
