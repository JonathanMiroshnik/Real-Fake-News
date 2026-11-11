/**
 * Insert/delete helpers shared by the table seeders.
 *
 * The idempotency rule lives here, in one place: a row whose key already exists
 * is skipped (and counted) unless `--force` is set, in which case the old row is
 * deleted first and written again. `insert` cannot update an existing row, so
 * delete+insert is what "re-seed this row" means.
 *
 * The origin stamp also lives here, for the same reason: every row this module
 * writes is mock content by definition, so no table seeder can forget to mark one
 * (roadmap entry 6 of `plans/README.md`).
 */
import type { DatabaseConfig } from '../../lib/database/databaseConfigurations.js';
import { getDatabase } from '../../lib/database/database.js';
import { insert, deleteMarkedRows, remove } from '../../lib/database/sqliteOperations.js';
import { MOCK_CONTENT_SOURCE } from '../../types/contentSource.js';
import type { SeedContext } from './seedContext.js';

/**
 * Stamps a row as mock content before it is written.
 *
 * @param row typed row; `contentSource` is carried by every marked scheme.
 * @returns the same row, marked `mock`.
 */
function stampAsMock<P>(row: P): P {
  return { ...row, contentSource: MOCK_CONTENT_SOURCE };
}

/**
 * Inserts one row if it is missing.
 *
 * @param row typed row (ArticleScheme, Writer, NewsItem, RecipeScheme).
 * @param dbConfig the table's configuration — also supplies the key.
 * @returns true if a row was written, false if it was skipped.
 */
export async function insertSeedRow<P>(
  row: P,
  dbConfig: DatabaseConfig<P>,
  context: SeedContext,
): Promise<boolean> {
  const key = await dbConfig.getKey(row);
  const alreadyExists = await dbConfig.exists(row);

  if (alreadyExists && !context.options.force) {
    context.report.skipped++;
    return false;
  }

  if (alreadyExists) {
    await remove(dbConfig, key);
  }

  const wasCreated = await insert(dbConfig, stampAsMock(row));
  if (!wasCreated) {
    context.report.skipped++;
    return false;
  }

  return true;
}

/**
 * Deletes every row of one table that is marked `mock` (used by --reset).
 *
 * Keyed on `contentSource` rather than on the `dev-` key prefix: the prefix is a
 * naming convention, the column is the contract. It also collects the rows a
 * mock content source wrote, whose keys nothing can predict in advance
 * (roadmap entry 6 of `plans/README.md`).
 *
 * @param dbConfig table to scrub.
 * @param context the run context (counters).
 * @returns true if at least one row was removed.
 */
export async function deleteMockRows<P>(
  dbConfig: DatabaseConfig<P>,
  context: SeedContext,
): Promise<boolean> {
  const db = getDatabase();
  const removedCount = deleteMarkedRows(db, dbConfig.source, MOCK_CONTENT_SOURCE);

  context.report.removed += removedCount;
  return removedCount > 0;
}
