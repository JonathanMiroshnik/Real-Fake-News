import { describe, it, expect } from 'vitest';
import { getUniqueKey, getNRandom } from '../general.js';

describe('getUniqueKey', () => {
  it('should return a string', () => {
    const key = getUniqueKey();
    expect(typeof key).toBe('string');
  });

  it('should return a UUID v4 formatted string (36 chars with 4 hyphens)', () => {
    const key = getUniqueKey();
    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    expect(key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('should return unique values on each call', () => {
    const keys = new Set<string>();
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
      keys.add(getUniqueKey());
    }

    expect(keys.size).toBe(iterations);
  });
});

describe('getNRandom', () => {
  it('should return an array of the requested length', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = getNRandom(arr, 3);
    expect(result).toHaveLength(3);
  });

  it('should return elements from the original array', () => {
    const arr = ['a', 'b', 'c', 'd', 'e'];
    const result = getNRandom(arr, 3);
    result.forEach((item) => {
      expect(arr).toContain(item);
    });
  });

  it('should return an empty array when n is 0', () => {
    const arr = [1, 2, 3];
    const result = getNRandom(arr, 0);
    expect(result).toEqual([]);
  });

  it('should not mutate the original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    getNRandom(arr, 2);
    expect(arr).toEqual(original);
  });

  it('should handle an empty source array', () => {
    const arr: number[] = [];
    const result = getNRandom(arr, 3);
    expect(result).toEqual([undefined, undefined, undefined]);
  });

  it('should handle requesting more items than the array contains', () => {
    const arr = [1, 2];
    const result = getNRandom(arr, 5);
    expect(result).toHaveLength(5);
    // Some values may be undefined since we're sampling beyond array length
    const definedValues = result.filter((v) => v !== undefined);
    definedValues.forEach((v) => {
      expect(arr).toContain(v);
    });
  });
});
