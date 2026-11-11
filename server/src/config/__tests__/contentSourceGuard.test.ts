import { describe, it, expect, vi, afterEach } from 'vitest';

/**
 * Pins 6.5 of `plans/dev-content-marking.md`: production must not hold invented
 * content, and must not start if it already does.
 *
 * Two kinds of check are covered here, and the distinction is the point. The
 * *intent* checks read configuration and can be tested as pure decisions. The
 * *data* check reads row counts, so `tallyContentSource` is stubbed; what matters
 * is whether a non-zero count stops the boot, not how SQLite counts.
 *
 * `tallyContentSource` is mocked with a plain `vi.mock`, hoisted above the import
 * below, so the guard captures the stub rather than the real counting function
 * (which would open the database — the native binding is not installed here).
 *
 * Note the specifier depth: this file lives in `src/config/__tests__/`, so its
 * siblings are two levels up (`../../services/...`). Written with a third `../`
 * the mock registers a path nothing imports, and the failure looks like "the mock
 * is ignored" rather than "the path is wrong".
 */
const tallyStub = vi.fn();
vi.mock('../../services/contentSourceQueries.js', () => ({
  tallyContentSource: (...args: unknown[]) => tallyStub(...args),
}));

import {
  assertContentSourceIsSafe,
  assertNoMockRowsInProduction,
  describeTally,
  isProductionEnvironment,
  totalRows,
  MockContentSourceInProductionError,
  MockRowsInProductionError,
} from '../contentSourceGuard.js';

const emptyTally = {
  contentSource: 'mock' as const,
  blogPosts: 0,
  newsItems: 0,
  writers: 0,
  recipes: 0,
  horoscopes: 0,
};

const seededTally = {
  ...emptyTally,
  blogPosts: 67,
  newsItems: 40,
};

afterEach(() => {
  tallyStub.mockReset();
  vi.restoreAllMocks();
});

describe('isProductionEnvironment', () => {
  it('is true only for exactly "production"', () => {
    expect(isProductionEnvironment({ NODE_ENV: 'production' })).toBe(true);
    expect(isProductionEnvironment({ NODE_ENV: 'development' })).toBe(false);
    expect(isProductionEnvironment({})).toBe(false);
  });
});

describe('tally helpers', () => {
  it('counts every marked table', () => {
    expect(totalRows(seededTally)).toBe(107);
    expect(totalRows(emptyTally)).toBe(0);
  });

  it('renders only the tables that hold rows, so a refusal is readable', () => {
    expect(describeTally(seededTally)).toBe('blogPosts=67, newsItems=40');
    expect(describeTally(emptyTally)).toBe('none');
  });
});

describe('assertContentSourceIsSafe', () => {
  it('refuses production configured for mock ports', () => {
    // CONTENT_SOURCE is read at import time; this process is whatever server/.env
    // says, so the assertion is written against both directions rather than
    // forcing one. The refusal itself must name the variable and the way out.
    const isMock = process.env.CONTENT_SOURCE?.trim().toLowerCase() === 'mock';
    const run = () => assertContentSourceIsSafe({ NODE_ENV: 'production' });

    if (isMock) {
      expect(run).toThrow(MockContentSourceInProductionError);
      expect(run).toThrow(/CONTENT_SOURCE/);
    } else {
      expect(run).not.toThrow();
    }
  });

  it('never refuses outside production', () => {
    expect(() => assertContentSourceIsSafe({ NODE_ENV: 'development' })).not.toThrow();
  });
});

describe('assertNoMockRowsInProduction', () => {
  it('refuses to start when production holds mock rows, naming the file and counts', async () => {
    tallyStub.mockResolvedValue(seededTally);

    const attempt = assertNoMockRowsInProduction('/data/database.db', {
      NODE_ENV: 'production',
    });

    await expect(attempt).rejects.toThrow(MockRowsInProductionError);
    await expect(attempt).rejects.toThrow(/\/data\/database\.db/);
    await expect(attempt).rejects.toThrow(/107 mock rows/);
  });

  it('allows a production database with no mock rows', async () => {
    tallyStub.mockResolvedValue(emptyTally);

    await expect(
      assertNoMockRowsInProduction('/data/database.db', { NODE_ENV: 'production' }),
    ).resolves.toEqual(emptyTally);
  });

  it('allows mock rows in development, because that is what they are for', async () => {
    tallyStub.mockResolvedValue(seededTally);

    await expect(
      assertNoMockRowsInProduction('/tmp/dev.db', { NODE_ENV: 'development' }),
    ).resolves.toEqual(seededTally);
  });

  it('counts mock rows specifically, never a total', async () => {
    tallyStub.mockResolvedValue(emptyTally);
    await assertNoMockRowsInProduction('/data/database.db', { NODE_ENV: 'development' });

    // A live row in production is the normal case; asking for the wrong origin
    // would refuse every healthy deployment.
    expect(tallyStub).toHaveBeenCalledWith('mock');
  });
});
