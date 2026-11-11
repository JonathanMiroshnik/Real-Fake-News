import { describe, it, expect } from 'vitest';
import { InvalidContentSourceError, parseContentSource } from '../contentSource.js';

/**
 * `CONTENT_SOURCE` decides whether the pipeline talks to real APIs or invents
 * content, so its parsing rules are safety rules, not preferences. These tests
 * pin the two directions that matter: unset must mean live, and a typo must fail
 * loudly rather than quietly choosing a side.
 */
describe('parseContentSource', () => {
  it('defaults to live when unset', () => {
    expect(parseContentSource(undefined)).toBe('live');
  });

  it('defaults to live when blank, because CONTENT_SOURCE= is how a value gets cleared', () => {
    expect(parseContentSource('')).toBe('live');
    expect(parseContentSource('   ')).toBe('live');
  });

  it('accepts both known sources', () => {
    expect(parseContentSource('live')).toBe('live');
    expect(parseContentSource('mock')).toBe('mock');
  });

  it('normalises case and surrounding whitespace', () => {
    expect(parseContentSource(' MOCK ')).toBe('mock');
    expect(parseContentSource('Live')).toBe('live');
  });

  it('throws on an unknown value instead of falling back to live or mock', () => {
    expect(() => parseContentSource('mok')).toThrow(InvalidContentSourceError);
    expect(() => parseContentSource('production')).toThrow(InvalidContentSourceError);
  });

  it('names the offending value and the valid options in the error', () => {
    try {
      parseContentSource('mok');
      expect.unreachable('should have thrown');
    } catch (error) {
      expect((error as Error).message).toContain('mok');
      expect((error as Error).message).toContain('live');
      expect((error as Error).message).toContain('mock');
    }
  });
});
