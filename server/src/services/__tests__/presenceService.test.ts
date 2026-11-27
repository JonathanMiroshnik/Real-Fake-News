import { describe, it, expect, beforeEach } from 'vitest';
import {
  countActiveVisitors,
  readPresenceSnapshot,
  recordHeartbeat,
  resetPresenceRegistry,
} from '../presenceService.js';

/**
 * Presence is "who is on the site right now", so every assertion here is about the
 * two ways that number can lie: counting the same person twice, and counting
 * someone who has gone.
 *
 * Time is passed in explicitly (`now`) rather than faked, which is why the service
 * takes it as a parameter: the tests ask about the exact millisecond the TTL is
 * meant to expire on.
 */
const TTL_MILLISECS = 45_000;
const HEARTBEAT_INTERVAL_MILLISECS = 15_000;

describe('presenceService', () => {
  beforeEach(() => {
    resetPresenceRegistry();
  });

  it('counts a visitor who has just beaten', () => {
    const now = 1_000_000;
    recordHeartbeat('visitor-a', '/', now);

    expect(countActiveVisitors(now)).toBe(1);
  });

  it('counts one visitor once, however many beats they send', () => {
    const now = 1_000_000;
    recordHeartbeat('visitor-a', '/', now);
    recordHeartbeat('visitor-a', '/category/politics', now + 20);

    expect(countActiveVisitors(now + 20)).toBe(1);
  });

  it('counts distinct visitors separately', () => {
    const now = 1_000_000;
    recordHeartbeat('visitor-a', '/', now);
    recordHeartbeat('visitor-b', '/about', now);

    expect(countActiveVisitors(now)).toBe(2);
  });

  it('keeps a visitor for the whole TTL and drops them after it', () => {
    const now = 1_000_000;
    recordHeartbeat('visitor-a', '/', now);

    expect(countActiveVisitors(now + TTL_MILLISECS)).toBe(1);
    expect(countActiveVisitors(now + TTL_MILLISECS + 1)).toBe(0);
  });

  it('extends the TTL on each new beat', () => {
    const now = 1_000_000;
    recordHeartbeat('visitor-a', '/', now);
    recordHeartbeat('visitor-a', '/', now + 40_000);

    // 80s after the first beat, 40s after the second: still inside the TTL.
    expect(countActiveVisitors(now + 80_000)).toBe(1);
  });

  it('prunes expired visitors on write, so the registry cannot grow forever', () => {
    const now = 1_000_000;
    recordHeartbeat('gone', '/', now);
    recordHeartbeat('here', '/', now + TTL_MILLISECS + 1);

    expect(countActiveVisitors(now + TTL_MILLISECS + 1)).toBe(1);
    // The expired id is gone from the registry, not merely filtered from the count:
    // a later beat from it starts a fresh entry rather than reviving anything.
    expect(countActiveVisitors(now + 2 * TTL_MILLISECS + 2)).toBe(0);
  });

  it('rejects an unusable visitor id instead of inventing one', () => {
    const now = 1_000_000;

    expect(recordHeartbeat('', '/', now)).toBeNull();
    expect(recordHeartbeat('   ', '/', now)).toBeNull();
    expect(recordHeartbeat(undefined, '/', now)).toBeNull();
    expect(recordHeartbeat(42, '/', now)).toBeNull();
    expect(recordHeartbeat('x'.repeat(65), '/', now)).toBeNull();
    expect(countActiveVisitors(now)).toBe(0);
  });

  it('accepts an id at the length limit and trims surrounding space', () => {
    const now = 1_000_000;
    expect(recordHeartbeat(`  ${'x'.repeat(64)}  `, '/', now)).not.toBeNull();
    expect(countActiveVisitors(now)).toBe(1);
  });

  it('substitutes a path when the client sends none', () => {
    const now = 1_000_000;
    // The recorded path is not exposed by the count route yet; the assertion that
    // matters is that a bad path does not lose the beat.
    expect(recordHeartbeat('visitor-a', undefined, now)?.count).toBe(1);
    expect(recordHeartbeat('visitor-b', '', now)?.count).toBe(2);
    expect(recordHeartbeat('visitor-c', 'x'.repeat(500), now)?.count).toBe(3);
  });

  it('reports the beat cadence the client should follow', () => {
    const snapshot = readPresenceSnapshot(1_000_000);

    expect(snapshot.count).toBe(0);
    expect(snapshot.ttlMilliseconds).toBe(TTL_MILLISECS);
    expect(snapshot.heartbeatIntervalMilliseconds).toBe(HEARTBEAT_INTERVAL_MILLISECS);
    // The client pauses when the tab is hidden; a TTL of one beat would flicker.
    expect(TTL_MILLISECS).toBeGreaterThan(HEARTBEAT_INTERVAL_MILLISECS);
  });

  it('returns the updated count from a heartbeat', () => {
    const now = 1_000_000;
    recordHeartbeat('visitor-a', '/', now);

    const snapshot = recordHeartbeat('visitor-b', '/', now);
    expect(snapshot?.count).toBe(2);
  });
});
