/**
 * CLI surface of `npm run seed:dev`.
 *
 * Three flags, no positional arguments:
 *   --reset        delete previously seeded rows (and their images) first
 *   --force        rewrite rows that already exist (default: skip them)
 *   --seed=<int>   PRNG seed for placeholder images (default: FIXED_SEED)
 *
 * Everything is validated up front so a typo fails before the script touches
 * the database.
 */
import { FIXED_SEED } from '../../services/contentSources/mocks/mockContent.js';

/** Parsed command line for the seeder. */
export interface SeedOptions {
  /** Delete seeded rows and images before writing (safe to combine with --force). */
  reset: boolean;
  /** Overwrite rows that already exist instead of skipping them. */
  force: boolean;
  /** PRNG seed: same value ⇒ byte-identical placeholder images. */
  seed: number;
  /** Print usage and exit without touching the database. */
  help: boolean;
}

const RESET_FLAG = '--reset';
const FORCE_FLAG = '--force';
const SEED_FLAG = '--seed';

/**
 * Parses `process.argv.slice(2)`.
 *
 * @throws If a flag is unknown or `--seed` has no integer value — a seeder that
 *   silently ignores a mistyped flag is worse than one that refuses to start.
 */
export function parseSeedArgs(argv: string[]): SeedOptions {
  const options: SeedOptions = { reset: false, force: false, seed: FIXED_SEED, help: false };

  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];

    if (argument === RESET_FLAG) {
      options.reset = true;
    } else if (argument === FORCE_FLAG) {
      options.force = true;
    } else if (argument === '--help' || argument === '-h') {
      options.help = true;
    } else if (argument === SEED_FLAG) {
      options.seed = parseSeedValue(argv[++index]);
    } else if (argument.startsWith(`${SEED_FLAG}=`)) {
      options.seed = parseSeedValue(argument.slice(SEED_FLAG.length + 1));
    } else {
      throw new Error(`Unknown argument "${argument}". Run with --help for usage.`);
    }
  }

  return options;
}

/** Reads one `--seed` value. */
function parseSeedValue(rawValue: string | undefined): number {
  const seedValue = Number(rawValue);

  const isMissing = rawValue === undefined || rawValue.trim() === '';
  if (isMissing || !Number.isInteger(seedValue)) {
    throw new Error(`--seed expects an integer, got "${rawValue ?? ''}"`);
  }

  return seedValue;
}

/**
 * Refuses to run against a production database.
 *
 * The seeder writes invented content and mock images; there is no scenario in
 * which that belongs in production. `--force` is the documented escape hatch for
 * the one legitimate case (a deliberate demo deployment), so it is the only way
 * past the guard.
 *
 * @throws If NODE_ENV is production and --force was not passed.
 */
export function assertNotProduction(
  options: SeedOptions,
  env: NodeJS.ProcessEnv = process.env,
): void {
  const isProduction = env.NODE_ENV === 'production';
  const isExplicitlyForced = options.force;

  if (isProduction && !isExplicitlyForced) {
    throw new Error(
      'seedDevData refuses to run with NODE_ENV=production — it writes mock content. ' +
        'Pass --force if this deployment is meant to be seeded with mock content.',
    );
  }

  if (isProduction) {
    console.warn('⚠️  Seeding a production database because --force was passed.');
  }
}

/** Prints usage. */
export function printSeedUsage(): void {
  console.log(`
Seeds the development database with mock content.

Usage:
  npm run seed:dev                 Insert anything that is missing (idempotent)
  npm run seed:dev -- --reset      Delete seeded rows and images, then re-insert
  npm run seed:dev -- --force      Overwrite existing seeded rows
  npm run seed:dev -- --seed 42    Use a different PRNG seed for placeholder images

Writes:
  rows into blog_posts, news_items, writers, foods, recipes and horoscopes, plus
  one placeholder PNG per writer, article and recipe under IMAGES_PATH (the
  compressed copy is generated too, so the client's image sizes work).

Notes:
  Default PRNG seed is ${FIXED_SEED}; the same seed produces identical images.
  Reads DATABASE_PATH and IMAGES_PATH from the environment (server/.env or compose).
  Content lives in src/services/contentSources/mocks/ and is shared with the
  mock content sources used in Phase 3.
`);
}
