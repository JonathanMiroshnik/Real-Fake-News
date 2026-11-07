import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getAllowedOrigins, parseOriginList } from '../corsOrigins.js';

/** Restores a process env var to its previous state (undefined = unset). */
const restoreEnvVar = (name: string, originalValue: string | undefined): void => {
  if (originalValue === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = originalValue;
};

describe('parseOriginList', () => {
  it('returns an empty list when unset or empty', () => {
    expect(parseOriginList(undefined)).toEqual([]);
    expect(parseOriginList('')).toEqual([]);
  });

  it('splits on commas and trims whitespace', () => {
    expect(parseOriginList('https://a.example,  https://b.example')).toEqual([
      'https://a.example',
      'https://b.example',
    ]);
  });

  it('drops empty entries', () => {
    expect(parseOriginList('https://a.example,,  ,')).toEqual(['https://a.example']);
  });
});

describe('getAllowedOrigins', () => {
  const originalClientUrl = process.env.CLIENT_URL;
  const originalAllowedOrigins = process.env.ALLOWED_ORIGINS;

  beforeEach(() => {
    delete process.env.CLIENT_URL;
    delete process.env.ALLOWED_ORIGINS;
  });

  afterEach(() => {
    restoreEnvVar('CLIENT_URL', originalClientUrl);
    restoreEnvVar('ALLOWED_ORIGINS', originalAllowedOrigins);
  });

  it('falls back to the production site and both dev servers', () => {
    expect(getAllowedOrigins()).toEqual([
      'https://real.sensorcensor.xyz',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
    ]);
  });

  it('adds CLIENT_URL and ALLOWED_ORIGINS on top of the defaults', () => {
    process.env.CLIENT_URL = 'https://staging.example.com';
    process.env.ALLOWED_ORIGINS = 'https://admin.example.com, https://api.example.com';

    const origins = getAllowedOrigins();

    expect(origins).toContain('https://staging.example.com');
    expect(origins).toContain('https://admin.example.com');
    expect(origins).toContain('https://api.example.com');
  });

  it('never lists the same origin twice', () => {
    process.env.CLIENT_URL = 'http://localhost:5173';

    const duplicatedOrigin = getAllowedOrigins().filter(
      (origin) => origin === 'http://localhost:5173',
    );

    expect(duplicatedOrigin).toHaveLength(1);
  });
});
