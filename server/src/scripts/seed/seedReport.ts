/**
 * What a seed run did, and how to say it out loud.
 *
 * The report exists because "did the seeder work?" must be answerable from the
 * terminal: every table gets an inserted/skipped count, and the summary repeats
 * the idempotency contract (second run inserts nothing).
 */
import type { SeedOptions } from './seedOptions.js';

/** Per-table outcome counts for one seed run. */
export interface SeedReport {
  writersInserted: number;
  articlesInserted: number;
  newsItemsInserted: number;
  recipesInserted: number;
  foodsInserted: number;
  horoscopesInserted: number;
  imagesCreated: number;
  /** Rows that already existed and were left alone (no --force). */
  skipped: number;
  /** Rows/images removed by --reset. */
  removed: number;
}

/** A report with every counter at zero. */
export function createEmptyReport(): SeedReport {
  return {
    writersInserted: 0,
    articlesInserted: 0,
    newsItemsInserted: 0,
    recipesInserted: 0,
    foodsInserted: 0,
    horoscopesInserted: 0,
    imagesCreated: 0,
    skipped: 0,
    removed: 0,
  };
}

/** Sum of every inserted row, for the summary line. */
function countInsertedRows(report: SeedReport): number {
  return (
    report.writersInserted +
    report.articlesInserted +
    report.newsItemsInserted +
    report.recipesInserted +
    report.foodsInserted +
    report.horoscopesInserted
  );
}

/**
 * Prints the run summary.
 *
 * @param report counters collected during the run.
 * @param options the parsed CLI options (only used to describe the mode).
 * @param elapsedMs wall-clock time, so a slow run is visible immediately.
 */
export function printSeedReport(report: SeedReport, options: SeedOptions, elapsedMs: number): void {
  const insertedRows = countInsertedRows(report);
  const mode = options.reset ? 'reset + seed' : options.force ? 'force seed' : 'seed';

  console.log('\n──────────────────────────────────────────────');
  console.log(`Dev seed complete (${mode}, PRNG seed ${options.seed}) in ${elapsedMs}ms`);
  console.log('──────────────────────────────────────────────');
  console.log(`  writers     ${report.writersInserted}`);
  console.log(`  articles    ${report.articlesInserted}`);
  console.log(`  news items  ${report.newsItemsInserted}`);
  console.log(`  recipes     ${report.recipesInserted}`);
  console.log(`  foods       ${report.foodsInserted}`);
  console.log(`  horoscopes  ${report.horoscopesInserted}`);
  console.log(`  images      ${report.imagesCreated}`);
  console.log(`  removed     ${report.removed}`);
  console.log(`  skipped     ${report.skipped}`);
  console.log('──────────────────────────────────────────────');

  if (insertedRows === 0 && report.removed === 0) {
    console.log('Nothing to do — already seeded. Use --reset to rewrite everything.');
  }
}
