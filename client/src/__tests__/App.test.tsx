import { describe, it, expect } from 'vitest';

/**
 * Basic smoke test — verifies that the App module can be loaded.
 * Full App rendering tests require all page components and contexts
 * to be available. For more comprehensive component tests, write
 * co-located tests in each component's directory.
 */
describe('App module', () => {
  it('should export a default component', async () => {
    const AppModule = await import('../App.tsx');
    expect(AppModule.default).toBeDefined();
    expect(typeof AppModule.default).toBe('function');
  });
});

