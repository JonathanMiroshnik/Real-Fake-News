import { getAllPostsAfterDate } from './blogService.js';
import { getDatabase } from '../lib/database/database.js';
import { countByContentSource } from '../lib/database/sqliteOperations.js';
import {
  blogDatabaseConfig,
  newsDatabaseConfig,
  recipeDatabaseConfig,
  writerDatabaseConfig,
} from '../lib/database/databaseConfigurations.js';
import type { ArticleScheme } from '../types/article.js';
import type { ContentSource } from '../types/contentSource.js';

/** An article that carries the origin of the pipeline that produced it. */
export type MarkedArticle = ArticleScheme & { contentSource: ContentSource };

/**
 * Articles published after `startDate` that came from one origin.
 *
 * The count a job needs to ask "has this pipeline already produced its quota?"
 * (roadmap entry 6 of `plans/README.md`). `getAllPostsAfterDate` stays
 * origin-agnostic because it answers a user-facing question — the blog shows
 * every article — while a quota question is about one producer.
 *
 * @param startDate exclusive lower bound on `timestamp`.
 * @param contentSource origin to count.
 * @returns the matching articles, oldest first as stored.
 */
export async function getAllPostsAfterDateBySource(
  startDate: Date,
  contentSource: ContentSource,
): Promise<MarkedArticle[]> {
  const result = await getAllPostsAfterDate(startDate);
  const marked = result.articles as MarkedArticle[];

  return marked.filter((article) => article.contentSource === contentSource);
}

/**
 * Counts horoscopes that came from one origin.
 *
 * Kept here rather than generalised into `countByContentSource` because
 * `horoscopes` is the one marked table with no `DatabaseConfig` — it is written
 * and read with direct SQL (`horoscopeService.saveHoroscopes`), so it has no
 * descriptor to pass. Flagging that asymmetry rather than inventing a config for
 * a table whose access pattern does not use one.
 *
 * @param contentSource origin to count.
 * @returns matching rows, or 0 if the count query fails.
 */
export async function countHoroscopesBySource(contentSource: ContentSource): Promise<number> {
  const db = getDatabase();

  try {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM horoscopes WHERE contentSource = ?');
    const result = stmt.get(contentSource) as { count?: number } | undefined;
    return result?.count || 0;
  } catch (error) {
    console.error('Error counting horoscopes by content source:', error);
    return 0;
  }
}

/**
 * One row of "rows this origin produced", for logging and the boot check.
 */
export interface ContentSourceTally {
  contentSource: ContentSource;
  blogPosts: number;
  newsItems: number;
  writers: number;
  recipes: number;
  horoscopes: number;
}

/**
 * Counts rows per table for one origin.
 *
 * Answers "is this database tainted?" with a number instead of a guess from the
 * `dev-` key prefix (roadmap entry 6 of `plans/README.md`).
 *
 * @param contentSource origin to count.
 * @returns per-table counts, all from the same origin.
 */
export async function tallyContentSource(
  contentSource: ContentSource,
): Promise<ContentSourceTally> {
  const [blogPosts, newsItems, writers, recipes, horoscopes] = await Promise.all([
    countByContentSource(blogDatabaseConfig, contentSource),
    countByContentSource(newsDatabaseConfig, contentSource),
    countByContentSource(writerDatabaseConfig, contentSource),
    countByContentSource(recipeDatabaseConfig, contentSource),
    countHoroscopesBySource(contentSource),
  ]);

  return { contentSource, blogPosts, newsItems, writers, recipes, horoscopes };
}
