import { describe, it, expect } from 'vitest';
import { InvalidJobsTimeScaleError, parseJobsTimeScale } from '../index.js';

/**
 * `JOBS_TIME_SCALE` decides how fast the scheduler cycles. Unset must mean the real
 * schedule, because a wrong default would either silently speed up production or
 * silently stop it — the same reasoning as `CONTENT_SOURCE`.
 */
describe('parseJobsTimeScale', () => {
  it('defaults to the real schedule when unset', () => {
    expect(parseJobsTimeScale(undefined)).toBe(1);
  });

  it('defaults when blank, because JOBS_TIME_SCALE= is how a value gets cleared', () => {
    expect(parseJobsTimeScale('')).toBe(1);
    expect(parseJobsTimeScale('   ')).toBe(1);
  });

  it('accepts whole and fractional scales above one', () => {
    expect(parseJobsTimeScale('60')).toBe(60);
    expect(parseJobsTimeScale('0.5')).toBe(0.5);
  });

  it('trims surrounding whitespace', () => {
    expect(parseJobsTimeScale(' 60 ')).toBe(60);
  });

  it.each(['0', '-5', 'fast', 'NaN'])('throws on %j instead of falling back to 1', (raw) => {
    expect(() => parseJobsTimeScale(raw)).toThrow(InvalidJobsTimeScaleError);
  });

  it('names the offending value in the error message', () => {
    expect(() => parseJobsTimeScale('fast')).toThrow(/JOBS_TIME_SCALE="fast"/);
  });
});
