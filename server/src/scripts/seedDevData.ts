/**
 * `npm run seed:dev` — writes the mock content described in
 * `plans/dev-content-seeding.md` into the development database.
 *
 * Replaces `generateMockData.ts`, which produced different nonsense on every run
 * and could not be repeated or cleaned up. This one is reviewable (the content is
 * a typed file), repeatable (fixed PRNG seed) and reversible (`--reset`).
 *
 * Usage:
 *   npm run seed:dev
 *   npm run seed:dev -- --reset
 *   npm run seed:dev -- --force --seed 42
 */
import { closeDatabase } from '../lib/database/database.js';
import { seedDatabase } from './seed/seedDatabase.js';
import { assertNotProduction, parseSeedArgs, printSeedUsage } from './seed/seedOptions.js';
import { printSeedReport } from './seed/seedReport.js';

/** Entry point: parse, guard, seed, report. */
async function main(): Promise<void> {
  const options = parseSeedArgs(process.argv.slice(2));

  if (options.help) {
    printSeedUsage();
    return;
  }

  assertNotProduction(options);

  const result = await seedDatabase(options);
  printSeedReport(result.report, options, result.elapsedMs);
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ seedDevData failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(() => {
    closeDatabase();
  });
