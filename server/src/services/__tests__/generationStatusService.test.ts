import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * The header's yellow light is only allowed to mean "something is being generated
 * right now". The rule agreed with the owner: yellow while the gap since the last
 * write is *shorter than the article-writing cadence* (12h), green otherwise.
 *
 * These tests pin that rule at its boundary and pin the thing a wrong answer would
 * cost: claiming work in progress when the site is simply between editions, which
 * is most of the day in normal operation.
 *
 * The status is one row in `generation_status`, written by `markGeneration()` on
 * the write side, so the stub answers exactly that `SELECT … WHERE key = ?`. The
 * database is stubbed the way `contentSourceQueries.test.ts` stubs it — the table
 * configs refuse to default `DATABASE_PATH`, and the stub never opens a file.
 */
let storedValue: string | null = null;

process.env.DATABASE_PATH = '/tmp/generationStatusService.test.db';

vi.mock('better-sqlite3', () => ({
  default: class DatabaseStub {
    pragma(): void {}
    exec(): void {}
    prepare(_sql: string) {
      return {
        run: () => ({ changes: 0 }),
        // The service reads one row by key; `null` here means "no marker yet".
        get: () => (storedValue === null ? undefined : { value: storedValue }),
        all: () => [],
      };
    }
  },
}));

/** Status depends only on the `now` it is given, so each case sets its own clock. */
const NOW = new Date('2026-11-17T12:00:00.000Z');
const ONE_HOUR_MILLISECS = 60 * 60 * 1000;
const CADENCE_MILLISECS = 12 * ONE_HOUR_MILLISECS;

/** A timestamp `hoursBeforeNow` hours before the fixed clock. */
function hoursAgo(hoursBeforeNow: number): string {
  return new Date(NOW.getTime() - hoursBeforeNow * ONE_HOUR_MILLISECS).toISOString();
}

async function loadService(): Promise<typeof import('../generationStatusService.js')> {
  return import('../generationStatusService.js');
}

beforeEach(() => {
  storedValue = null;
});

describe('parseStoredTimestamp', () => {
  it('reads the ISO 8601 UTC shape the insert paths write', async () => {
    const { parseStoredTimestamp } = await loadService();

    expect(parseStoredTimestamp('2026-11-17T12:00:00.000Z')?.toISOString()).toBe(
      '2026-11-17T12:00:00.000Z',
    );
  });

  it('reads SQLite CURRENT_TIMESTAMP as UTC, not as local time', async () => {
    const { parseStoredTimestamp } = await loadService();

    // "2026-11-17 12:00:00" carries no zone: `new Date()` alone would read it as
    // 12:00 local, shifting the row by the machine's UTC offset.
    expect(parseStoredTimestamp('2026-11-17 12:00:00')?.toISOString()).toBe(
      '2026-11-17T12:00:00.000Z',
    );
  });

  it('returns null for empty and unparseable values', async () => {
    const { parseStoredTimestamp } = await loadService();

    expect(parseStoredTimestamp(null)).toBeNull();
    expect(parseStoredTimestamp('')).toBeNull();
    expect(parseStoredTimestamp('not a date')).toBeNull();
  });
});

describe('readGenerationStatus', () => {
  it('reports nothing generated when the marker row is absent', async () => {
    const { readGenerationStatus } = await loadService();

    const status = readGenerationStatus(NOW);

    expect(status.lastGeneratedAt).toBeNull();
    expect(status.isGenerating).toBe(false);
  });

  it('is yellow straight after a write', async () => {
    storedValue = hoursAgo(0.01);
    const { readGenerationStatus } = await loadService();

    expect(readGenerationStatus(NOW).isGenerating).toBe(true);
  });

  it('is still yellow one millisecond inside the cadence', async () => {
    storedValue = new Date(NOW.getTime() - CADENCE_MILLISECS + 1).toISOString();
    const { readGenerationStatus } = await loadService();

    expect(readGenerationStatus(NOW).isGenerating).toBe(true);
  });

  it('is green at exactly the cadence', async () => {
    storedValue = hoursAgo(12);
    const { readGenerationStatus } = await loadService();

    expect(readGenerationStatus(NOW).isGenerating).toBe(false);
  });

  it('is green once the gap outgrows the cadence', async () => {
    storedValue = hoursAgo(30);
    const { readGenerationStatus } = await loadService();

    const status = readGenerationStatus(NOW);

    expect(status.isGenerating).toBe(false);
    expect(status.lastGeneratedAt).toBe(hoursAgo(30));
  });

  it('reads a legacy space-separated timestamp without shifting it', async () => {
    // The shape SQLite's `CURRENT_TIMESTAMP` wrote before the default changed.
    storedValue = '2026-11-17 11:00:00';
    const { readGenerationStatus } = await loadService();

    expect(readGenerationStatus(NOW).lastGeneratedAt).toBe('2026-11-17T11:00:00.000Z');
  });

  it('treats a timestamp in the future as "now" rather than a negative gap', async () => {
    storedValue = hoursAgo(-1);
    const { readGenerationStatus } = await loadService();

    const status = readGenerationStatus(NOW);

    expect(status.lastGeneratedAt).toBe(NOW.toISOString());
    expect(status.isGenerating).toBe(true);
  });
});
