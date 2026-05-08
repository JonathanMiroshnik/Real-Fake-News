import { describe, it, expect } from 'vitest';
import { getLatestTime, MINUTE_MILLISECS, HOUR_MILLISECS, DAY_MILLISECS } from '../timeService.ts';

describe('timeService', () => {
  describe('getLatestTime', () => {
    it('should return "Less than a minute ago" for very small values', () => {
      expect(getLatestTime(1000)).toBe('Less than a minute ago');
      expect(getLatestTime(0)).toBe('Less than a minute ago');
    });

    it('should return minutes for values between 1 and 60 minutes', () => {
      expect(getLatestTime(MINUTE_MILLISECS * 5)).toBe('5 minutes ago');
      expect(getLatestTime(MINUTE_MILLISECS * 30)).toBe('30 minutes ago');
    });

    it('should handle values at the 1-hour boundary', () => {
      // Function uses > not >=, so exactly 1 hour returns minutes
      expect(getLatestTime(HOUR_MILLISECS)).toBe('60 minutes ago');
      // Just over 1 hour triggers "1 hour ago"
      expect(getLatestTime(HOUR_MILLISECS + 1)).toBe('1 hour ago');
    });

    it('should return hours for values between 1 and 24 hours', () => {
      expect(getLatestTime(HOUR_MILLISECS * 3)).toBe('3 hours ago');
      expect(getLatestTime(HOUR_MILLISECS * 12)).toBe('12 hours ago');
    });

    it('should handle the 2-hour boundary', () => {
      // Function uses > not >=, so exactly 2 hours falls through to "1 hour ago"
      expect(getLatestTime(HOUR_MILLISECS * 2)).toBe('1 hour ago');
      // Just over 2 hours triggers the hours calculation
      expect(getLatestTime(HOUR_MILLISECS * 2 + 1)).toBe('3 hours ago');
    });

    it('should handle the 1-day boundary', () => {
      // Exactly 1 day returns "24 hours ago" (falls through hours check)
      expect(getLatestTime(DAY_MILLISECS)).toBe('24 hours ago');
      // Just over 1 day triggers "1 day ago"
      expect(getLatestTime(DAY_MILLISECS + 1)).toBe('1 day ago');
    });

    it('should return days for values over 2 days', () => {
      expect(getLatestTime(DAY_MILLISECS * 3)).toBe('3 days ago');
      expect(getLatestTime(DAY_MILLISECS * 7)).toBe('7 days ago');
    });
  });
});
