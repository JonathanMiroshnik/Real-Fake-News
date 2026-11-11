import { describe, it, expect } from 'vitest';
import { LIVE_CONTENT_SOURCE, MOCK_CONTENT_SOURCE, type ContentSource } from '../contentSource.js';

/**
 * Pins the wire format of the `contentSource` marker
 * (roadmap entry 6 of `plans/README.md`).
 *
 * The two literal strings are a database contract — they are what the column
 * default and every `WHERE contentSource = ?` query in the seeder and the future
 * mock adapters spell out. Renaming the constants is fine; changing these values
 * silently orphans every row already stored under the old spelling, so it has to
 * fail here first.
 */
describe('contentSource marker', () => {
  it('keeps the two stored values stable', () => {
    expect(LIVE_CONTENT_SOURCE).toBe('live');
    expect(MOCK_CONTENT_SOURCE).toBe('mock');
  });

  it('exposes only the two origins, as a narrowing type', () => {
    const origins: ContentSource[] = ['live', 'mock'];
    expect(origins.includes(LIVE_CONTENT_SOURCE)).toBe(true);
    expect(origins.includes(MOCK_CONTENT_SOURCE)).toBe(true);
  });

  it('does not reuse one value for both origins', () => {
    expect(LIVE_CONTENT_SOURCE).not.toBe(MOCK_CONTENT_SOURCE);
  });
});
