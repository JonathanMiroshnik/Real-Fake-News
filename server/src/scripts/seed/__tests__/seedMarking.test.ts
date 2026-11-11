import { describe, it, expect } from 'vitest';
import {
  MOCK_ARTICLES,
  MOCK_NEWS_ITEMS,
  MOCK_RECIPES,
  MOCK_WRITERS,
} from '../../../services/contentSources/mocks/mockContent.js';
import { LIVE_CONTENT_SOURCE, MOCK_CONTENT_SOURCE } from '../../../types/contentSource.js';
import type { SeedContext } from '../seedContext.js';
import { createEmptyReport } from '../seedReport.js';
import { buildArticleRow, buildNewsItemRow, buildWriterRow } from '../seedBlogContent.js';
import { buildRecipeRow } from '../seedKitchenContent.js';

/**
 * Pins the origin stamp on seeded rows (roadmap entry 6 of `plans/README.md`).
 *
 * The stamp is what lets `--reset` delete mock rows without guessing at the `dev-`
 * key prefix, and what lets a later reader ask the database "is this row fake?"
 * instead of asking a naming convention. A seeded row that reached the database
 * marked `live` would be indistinguishable from pipeline output, so every row
 * builder is checked here rather than relying on each table seeder remembering.
 *
 * The builders take a context only for the run clock and PRNG, so this needs no
 * database — which also keeps the test runnable where the native `better-sqlite3`
 * binding is unavailable.
 */
function createTestContext(): SeedContext {
  return {
    options: { reset: false, force: false, seed: 1, help: false },
    random: () => 0.5,
    report: createEmptyReport(),
    now: new Date('2026-11-09T12:00:00.000Z'),
  };
}

describe('seeded rows carry the mock marker', () => {
  const context = createTestContext();

  it('marks writer rows as mock, never as live', () => {
    const writerRow = buildWriterRow(MOCK_WRITERS[0], context);

    expect(writerRow.contentSource).toBe(MOCK_CONTENT_SOURCE);
    expect(writerRow.contentSource).not.toBe(LIVE_CONTENT_SOURCE);
  });

  it('marks article rows as mock', () => {
    const author = buildWriterRow(MOCK_WRITERS[0], context);
    const articleRow = buildArticleRow(MOCK_ARTICLES[0], author, context);

    expect(articleRow.contentSource).toBe(MOCK_CONTENT_SOURCE);
  });

  it('marks news item rows as mock', () => {
    const newsRow = buildNewsItemRow(MOCK_NEWS_ITEMS[0], context);

    expect(newsRow.contentSource).toBe(MOCK_CONTENT_SOURCE);
  });

  it('marks recipe rows as mock', () => {
    const author = buildWriterRow(MOCK_WRITERS[0], context);
    const recipeRow = buildRecipeRow(MOCK_RECIPES[0], author, context);

    expect(recipeRow.contentSource).toBe(MOCK_CONTENT_SOURCE);
  });

  it('marks every row of the mock data set, not just the first', () => {
    const author = buildWriterRow(MOCK_WRITERS[0], context);
    const sources = [
      ...MOCK_WRITERS.map((writer) => buildWriterRow(writer, context).contentSource),
      ...MOCK_ARTICLES.map((article) => buildArticleRow(article, author, context).contentSource),
      ...MOCK_NEWS_ITEMS.map((newsItem) => buildNewsItemRow(newsItem, context).contentSource),
      ...MOCK_RECIPES.map((recipe) => buildRecipeRow(recipe, author, context).contentSource),
    ];

    expect(sources.length).toBeGreaterThan(0);
    expect(new Set(sources)).toEqual(new Set([MOCK_CONTENT_SOURCE]));
  });
});
