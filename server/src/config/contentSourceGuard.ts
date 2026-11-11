/**
 * Refuses to let invented content into a production database.
 *
 * Three checks, deliberately of two different kinds. The first two read *intent* —
 * what this process was configured to do — and run before the schema is touched.
 * The third reads the *data*, and is the only one that can catch a mistake made
 * before this process started: a compose command that pointed at the wrong volume,
 * a demo container reused for a real deployment. Intent checks cannot see that;
 * only a row count can.
 *
 * The shape follows `config/paths.ts`: refuse to start rather than degrade. A
 * server that boots and serves invented articles is worse than one that exits,
 * because the failure is invisible from the outside.
 */
import { CONTENT_SOURCE, isMockContentSource } from './contentSource.js';
import { initializeSchema } from '../lib/database/schema.js';
import { tallyContentSource } from '../services/contentSourceQueries.js';
import type { ContentSourceTally } from '../services/contentSourceQueries.js';
import { MOCK_CONTENT_SOURCE } from '../types/contentSource.js';
import { debugWarn } from '../utils/debugLogger.js';

/** The environment variable that decides whether the data checks apply. */
const PRODUCTION_ENV = 'production';

/** Thrown when a production process is configured to invent content. */
export class MockContentSourceInProductionError extends Error {
  constructor() {
    super(
      `CONTENT_SOURCE="${CONTENT_SOURCE}" with NODE_ENV=${PRODUCTION_ENV} — a production server must ` +
        'not generate invented content. Unset CONTENT_SOURCE (it defaults to "live") or set it to ' +
        '"live". If this really is a demo deployment, run it with NODE_ENV set to something else.',
    );
    this.name = 'MockContentSourceInProductionError';
  }
}

/** Thrown when a production database already holds rows from a mock pipeline. */
export class MockRowsInProductionError extends Error {
  constructor(tally: ContentSourceTally, databasePath: string) {
    super(
      `NODE_ENV=${PRODUCTION_ENV} but the database at ${databasePath} holds ` +
        `${totalRows(tally)} mock rows: ${describeTally(tally)}. These were written by a mock ` +
        'pipeline or the seeder. Refusing to start: clear them with `npm run seed:reset` (dev) or ' +
        'point DATABASE_PATH at the right file, then restart.',
    );
    this.name = 'MockRowsInProductionError';
  }
}

/**
 * True when this process is configured as production.
 *
 * @param env Environment source, so a test does not have to mutate the process.
 */
export function isProductionEnvironment(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV === PRODUCTION_ENV;
}

/** Renders a tally as `table: n` pairs, omitting tables with no rows. */
export function describeTally(tally: ContentSourceTally): string {
  const counted = Object.entries(tally).filter(([key, count]) => key !== 'contentSource' && count > 0);
  if (counted.length === 0) {
    return 'none';
  }

  return counted.map(([key, count]) => `${key}=${count}`).join(', ');
}

/** Total rows of one origin across every marked table. */
export function totalRows(tally: ContentSourceTally): number {
  return (
    tally.blogPosts + tally.newsItems + tally.writers + tally.recipes + tally.horoscopes
  );
}

/**
 * Checks what this process intends to do, before any data is read.
 *
 * @param env Environment source; defaults to the process.
 * @throws {MockContentSourceInProductionError} If production is configured for mock ports.
 */
export function assertContentSourceIsSafe(env: NodeJS.ProcessEnv = process.env): void {
  const isUnsafeCombination = isProductionEnvironment(env) && isMockContentSource;
  if (isUnsafeCombination) {
    throw new MockContentSourceInProductionError();
  }
}

/**
 * Checks the *data*, not the intent: does production already hold mock rows?
 *
 * Opening the database through `tallyContentSource` is what creates the schema,
 * so this call has to happen after the intent checks (a refused configuration
 * should never touch a file) and before the app is imported.
 *
 * @param databasePath Shown in the refusal so the operator knows which file was read.
 * @param env Environment source; defaults to the process.
 * @returns The mock tally, for logging by the caller.
 * @throws {MockRowsInProductionError} If production holds any mock row.
 */
export async function assertNoMockRowsInProduction(
  databasePath: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<ContentSourceTally> {
  const mockTally = await tallyContentSource(MOCK_CONTENT_SOURCE);
  const mockRowCount = totalRows(mockTally);

  if (isProductionEnvironment(env) && mockRowCount > 0) {
    throw new MockRowsInProductionError(mockTally, databasePath);
  }

  return mockTally;
}

/**
 * Boot-time content checks, in the order they must run.
 *
 * The schema is initialised here rather than in `app.ts` because the count below
 * needs the tables to exist, and `app.ts` is not imported until these checks have
 * passed. It is idempotent, so `app.ts` calling it again is harmless.
 *
 * @param databasePath Shown in a data refusal.
 * @returns The mock tally, so the startup log can report it.
 */
export async function checkContentSourceAtBoot(
  databasePath: string,
): Promise<ContentSourceTally> {
  assertContentSourceIsSafe();
  initializeSchema();

  return assertNoMockRowsInProduction(databasePath);
}

/** Reports the mock row count, so a dev run can explain a feed that looks odd. */
export function logMockRowCount(tally: ContentSourceTally): void {
  const mockRowCount = totalRows(tally);

  if (mockRowCount === 0) {
    return;
  }

  debugWarn(
    `⚠️  ${mockRowCount} mock rows in the database (${describeTally(tally)}). ` +
      'These were written by CONTENT_SOURCE=mock or the seeder. They are marked, not hidden — ' +
      'interactive clients can tell them apart, automated ones (the pipeline) cannot. ' +
      'Run `npm run seed:reset` to clear them.',
  );
}

export { CONTENT_SOURCE };
