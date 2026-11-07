/**
 * One source of fake content for the whole project.
 *
 * The dev seeder (`scripts/seedDevData.ts`) reads this module today; the mock
 * content-source adapters in Phase 3 read the same arrays, so there is exactly
 * one place where invented content is written down
 * (`plans/dev-content-seeding.md`).
 *
 * Why TS and not a committed `database.db` or a JSON dump: a typed array makes a
 * schema change a compile error, and a reviewable diff — see "Alternatives
 * considered" in the plan.
 *
 * Every key starts with `dev-`, which is what lets the seeder skip rows it has
 * already written and `--reset` delete exactly its own output.
 */
import { MOCK_ARTICLES } from './mockArticles.js';
import { MOCK_HOROSCOPE_ENTRIES } from './mockHoroscopes.js';
import { MOCK_NEWS_ITEMS } from './mockNewsItems.js';
import { MOCK_FOODS, MOCK_RECIPES } from './mockRecipes.js';
import { MOCK_WRITERS } from './mockWriters.js';

export * from './types.js';
export { MOCK_ARTICLES } from './mockArticles.js';
export { MOCK_HOROSCOPE_ENTRIES, buildMockAstrologicalData } from './mockHoroscopes.js';
export { MOCK_NEWS_ITEMS } from './mockNewsItems.js';
export { MOCK_FOODS, MOCK_RECIPES } from './mockRecipes.js';
export { MOCK_WRITERS } from './mockWriters.js';

/** Prefix shared by every seeded row key, image filename and prism food name. */
export const SEEDED_KEY_PREFIX = 'dev-';

/** Default PRNG seed: two runs with the same value produce identical images. */
export const FIXED_SEED = 20261107;

/** How much content a full seed writes — kept next to the data it describes. */
export const MOCK_CONTENT_COUNTS = {
  writers: MOCK_WRITERS.length,
  articles: MOCK_ARTICLES.length,
  newsItems: MOCK_NEWS_ITEMS.length,
  recipes: MOCK_RECIPES.length,
  horoscopes: MOCK_HOROSCOPE_ENTRIES.length,
  foods: MOCK_FOODS.length,
} as const;

/**
 * Small deterministic PRNG (mulberry32).
 *
 * Deterministic output is the whole point of the seeder: placeholder image
 * colours must not change on every run, or every re-seed would produce new image
 * bytes for identical rows.
 *
 * @param seed 32-bit seed; the same seed gives the same sequence.
 * @returns A function returning successive values in [0, 1).
 */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Seeded random source for callers that want the default seed.
 *
 * @param seed defaults to FIXED_SEED (the `--seed` CLI flag overrides it).
 */
export function createSeededRandom(seed: number = FIXED_SEED): () => number {
  return mulberry32(seed);
}
