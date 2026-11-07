/**
 * Insert/delete helpers shared by the table seeders.
 *
 * The idempotency rule lives here, in one place: a row whose key already exists
 * is skipped (and counted) unless `--force` is set, in which case the old row is
 * deleted first and written again. `createPost` cannot update, so delete+insert
 * is what "re-seed this row" means.
 */
import type { DatabaseConfig } from '../../lib/database/databaseConfigurations.js';
import { createPost, deletePost } from '../../lib/database/sqliteOperations.js';
import type { SeedContext } from './seedContext.js';

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
    await deletePost(key, dbConfig);
  }

  const wasCreated = await createPost(row, dbConfig);
  if (!wasCreated) {
    context.report.skipped++;
    return false;
  }

  return true;
}

/**
 * Deletes one row by key if it exists (used by --reset).
 *
 * @param key primary key value (`key`, or `article_id` for news items).
 * @returns true if a row was removed.
 */
export async function deleteSeedRowByKey<P>(
  key: string,
  dbConfig: DatabaseConfig<P>,
  context: SeedContext,
): Promise<boolean> {
  const wasDeleted = await deletePost(key, dbConfig);

  if (wasDeleted) {
    context.report.removed++;
  }

  return wasDeleted;
}
