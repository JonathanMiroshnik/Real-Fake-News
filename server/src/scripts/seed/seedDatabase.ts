/**
 * Orchestrates one seed run: schema, optional reset, then every table in
 * dependency order (writers → articles/recipes, because both embed an author).
 *
 * Kept separate from the CLI entry (`seedDevData.ts`) so tests and future
 * "seed on boot" callers can run the same code without process.argv or exit codes.
 */
import { initializeSchema } from '../../lib/database/schema.js';
import { createSeededRandom } from '../../services/contentSources/mocks/mockContent.js';
import {
  resetSeededBlogContent,
  seedArticles,
  seedNewsItems,
  seedWriters,
} from './seedBlogContent.js';
import {
  resetSeededKitchenContent,
  seedFoods,
  seedHoroscopes,
  seedRecipes,
} from './seedKitchenContent.js';
import type { SeedContext } from './seedContext.js';
import type { SeedOptions } from './seedOptions.js';
import { createEmptyReport, type SeedReport } from './seedReport.js';

/** Outcome of one seed run. */
export interface SeedResult {
  report: SeedReport;
  elapsedMs: number;
}

/** Builds the per-run context (one clock, one PRNG, one report). */
function createSeedContext(options: SeedOptions): SeedContext {
  return {
    options,
    random: createSeededRandom(options.seed),
    report: createEmptyReport(),
    now: new Date(),
  };
}

/** Deletes everything a previous run wrote, rows and images alike. */
async function resetSeededContent(context: SeedContext): Promise<void> {
  await resetSeededBlogContent(context);
  await resetSeededKitchenContent(context);
}

/**
 * Seeds the development database.
 *
 * Idempotent by construction: without `--force` a second run inserts nothing
 * (every row is found by its `dev-…` key), and `--reset` removes only rows and
 * images the seeder itself created.
 *
 * @param options parsed CLI flags.
 * @returns counters plus wall-clock time, for the terminal summary.
 */
export async function seedDatabase(options: SeedOptions): Promise<SeedResult> {
  const startedAt = Date.now();
  initializeSchema();

  const context = createSeedContext(options);

  if (options.reset) {
    await resetSeededContent(context);
  }

  const authorsByKey = await seedWriters(context);
  await seedArticles(context, authorsByKey);
  await seedNewsItems(context);
  await seedRecipes(context, authorsByKey);
  seedFoods(context);
  seedHoroscopes(context);

  return { report: context.report, elapsedMs: Date.now() - startedAt };
}
