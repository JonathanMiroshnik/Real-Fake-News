import { describe, it, expect, vi, afterEach } from 'vitest';

describe('port selection by CONTENT_SOURCE', () => {
  const original = process.env.CONTENT_SOURCE;

  afterEach(() => {
    if (original === undefined) delete process.env.CONTENT_SOURCE;
    else process.env.CONTENT_SOURCE = original;
    vi.resetModules();
  });

  it('selects the mock ports when CONTENT_SOURCE=mock', async () => {
    process.env.CONTENT_SOURCE = 'mock';
    vi.resetModules();
    const { ports, configuredContentSource } = await import('../index.js');

    expect(configuredContentSource).toBe('mock');
    expect(ports.news.contentSource).toBe('mock');
    expect(ports.text.contentSource).toBe('mock');
    expect(ports.image.contentSource).toBe('mock');
    expect(ports.transit.contentSource).toBe('mock');
  });

  it('selects the live ports when CONTENT_SOURCE is unset', async () => {
    delete process.env.CONTENT_SOURCE;
    vi.resetModules();
    const { ports, configuredContentSource } = await import('../index.js');

    expect(configuredContentSource).toBe('live');
    expect(ports.news.contentSource).toBe('live');
    expect(ports.text.contentSource).toBe('live');
    expect(ports.image.contentSource).toBe('live');
    expect(ports.transit.contentSource).toBe('live');
  });
});
