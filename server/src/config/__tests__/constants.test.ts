import { describe, it, expect } from 'vitest';
// ⚠️ Import from the .ts file directly, not .js.
// constants.js is a legacy compiled file that is missing many exports.
// Using .ts extension ensures Vitest resolves to the TypeScript source.
import {
  VALID_CATEGORIES,
  MIN_MINUTES_BEFORE_TO_CHECK,
  MAX_MINUTES_BEFORE_TO_CHECK,
  FALLBACK_MINUTES_BEFORE_TO_CHECK,
  MIN_ACCEPTABLE_ARTICLES,
  DAY_MILLISECS,
  ONE_HOUR_MILLISECS,
  TEN_MINUTES_MILLISECONDS,
} from '../constants.js';

describe('Configuration Constants', () => {
  describe('Categories', () => {
    it('should have valid category names', () => {
      expect(VALID_CATEGORIES).toContain('Politics');
      expect(VALID_CATEGORIES).toContain('Sports');
      expect(VALID_CATEGORIES).toContain('Culture');
      expect(VALID_CATEGORIES).toContain('Economics');
      expect(VALID_CATEGORIES).toContain('Technology');
      expect(VALID_CATEGORIES).toContain('Food');
    });

    it('should have at least 5 categories', () => {
      expect(VALID_CATEGORIES.length).toBeGreaterThanOrEqual(5);
    });

    it('should not have duplicate categories', () => {
      const unique = new Set(VALID_CATEGORIES);
      expect(unique.size).toBe(VALID_CATEGORIES.length);
    });
  });

  describe('Time Constants', () => {
    it('should define DAY_MILLISECS as 24 hours in milliseconds', () => {
      expect(DAY_MILLISECS).toBe(24 * 60 * 60 * 1000);
    });

    it('should define ONE_HOUR_MILLISECS as 60 minutes in milliseconds', () => {
      expect(ONE_HOUR_MILLISECS).toBe(60 * 60 * 1000);
    });

    it('should define TEN_MINUTES_MILLISECONDS as 10 minutes in milliseconds', () => {
      expect(TEN_MINUTES_MILLISECONDS).toBe(10 * 60 * 1000);
    });

    it('should define MIN_MINUTES_BEFORE_TO_CHECK as 24 hours', () => {
      expect(MIN_MINUTES_BEFORE_TO_CHECK).toBe(24 * 60);
    });

    it('should define MAX_MINUTES_BEFORE_TO_CHECK as 4 days', () => {
      expect(MAX_MINUTES_BEFORE_TO_CHECK).toBe(24 * 60 * 4);
    });

    it('should define FALLBACK_MINUTES_BEFORE_TO_CHECK as 1 year', () => {
      expect(FALLBACK_MINUTES_BEFORE_TO_CHECK).toBe(365 * 24 * 60);
    });
  });

  describe('Article Thresholds', () => {
    it('should define MIN_ACCEPTABLE_ARTICLES as a positive number', () => {
      expect(MIN_ACCEPTABLE_ARTICLES).toBeGreaterThan(0);
      expect(MIN_ACCEPTABLE_ARTICLES).toBe(15);
    });

    it('should have fallback longer than min and max windows', () => {
      expect(FALLBACK_MINUTES_BEFORE_TO_CHECK).toBeGreaterThan(MAX_MINUTES_BEFORE_TO_CHECK);
      expect(MAX_MINUTES_BEFORE_TO_CHECK).toBeGreaterThan(MIN_MINUTES_BEFORE_TO_CHECK);
    });
  });
});
