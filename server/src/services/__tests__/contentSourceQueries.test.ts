import { describe, it, expect, vi } from 'vitest';

/**
 * Pins 6.3 of roadmap entry 6 of `plans/README.md`: a question about one pipeline is
 * answered from rows of that pipeline only.
 *
 * Two failure modes are covered, and they are the same mistake seen from two
 * ends. A quota counted over the whole table says "67 articles already exist"
 * about a seeded database and asks a working mock pipeline for nothing. A news
 * read that ignores origin lets a mock run rewrite live news, which stamps the
 * output `mock` while inheriting live text — the marking would be true about the
 * producer and false about the content.
 *
 * The stub answers `findAll` from a fixed row list, so these assert the filtering
 * rule rather than SQL.
 */
const rowsByTable: Record<string, unknown[]> = {};

// The table configs resolve `DATABASE_PATH` at import time and refuse to default
// it; the stub below never opens a file, so any path satisfies them.
process.env.DATABASE_PATH = '/tmp/contentSourceQueries.test.db';

vi.mock('better-sqlite3', () => ({
  default: class DatabaseStub {
    pragma(): void {}
    exec(): void {}
    prepare(sql: string) {
      return {
        run: () => ({ changes: 1 }),
        get: () => {
          const match = sql.match(/FROM (\w+) WHERE contentSource = \?/);
          const table = match?.[1];
          const count = table ? (rowsByTable[table] ?? []).filter(Boolean).length : 0;
          return { count };
        },
        all: () => [],
      };
    }
  },
}));

vi.mock('../../config/env.js', () => ({
  IMAGES_PATH: '/tmp/images',
  NODE_ENV: 'test',
  LOG_LEVEL: 'error',
}));

vi.mock('../../utils/logger.js', () => ({
  debugLog: () => {},
  debugWarn: () => {},
  debugInfo: () => {},
}));

vi.mock('../blogService.js', () => ({
  getAllPostsAfterDate: async () => ({
    success: true,
    articles: rowsByTable['blog_posts'] ?? [],
  }),
}));

describe('getAllPostsAfterDateBySource', () => {
  it('returns only the articles of the requested origin', async () => {
    rowsByTable['blog_posts'] = [
      { key: 'mock-1', timestamp: new Date().toISOString(), contentSource: 'mock' },
      { key: 'live-1', timestamp: new Date().toISOString(), contentSource: 'live' },
      { key: 'mock-2', timestamp: new Date().toISOString(), contentSource: 'mock' },
    ];

    const { getAllPostsAfterDateBySource } = await import('../contentSourceQueries.js');
    const mockArticles = await getAllPostsAfterDateBySource(new Date(0), 'mock');

    expect(mockArticles.map((article) => article.key)).toEqual(['mock-1', 'mock-2']);
  });

  it('counts nothing for an origin that has produced nothing', async () => {
    rowsByTable['blog_posts'] = [
      { key: 'live-1', timestamp: new Date().toISOString(), contentSource: 'live' },
    ];

    const { getAllPostsAfterDateBySource } = await import('../contentSourceQueries.js');
    const mockArticles = await getAllPostsAfterDateBySource(new Date(0), 'mock');

    expect(mockArticles).toEqual([]);
  });
});

describe('tallyContentSource', () => {
  it('reports one count per table for the requested origin', async () => {
    rowsByTable['blog_posts'] = [1, 2, 3];
    rowsByTable['news_items'] = [1];
    rowsByTable['writers'] = [];
    rowsByTable['recipes'] = [1, 2];
    rowsByTable['horoscopes'] = [1, 2, 3, 4];

    const { tallyContentSource } = await import('../contentSourceQueries.js');
    const tally = await tallyContentSource('mock');

    expect(tally).toEqual({
      contentSource: 'mock',
      blogPosts: 3,
      newsItems: 1,
      writers: 0,
      recipes: 2,
      horoscopes: 4,
    });
  });
});
