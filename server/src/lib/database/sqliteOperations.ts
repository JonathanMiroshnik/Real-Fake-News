import { getDatabase } from './database.js';
import { DatabaseConfig } from './databaseConfigurations.js';
import Database from 'better-sqlite3';
import { getUniqueKey } from '../../utils/general.js';
import {
  LIVE_CONTENT_SOURCE,
  MOCK_CONTENT_SOURCE,
  type ContentSource,
} from '../../types/contentSource.js';

// Every persisted row is addressed by one key
export interface Row {
  key: string | undefined;
}

/**
 * Maps DatabaseConfig source (table name) to actual SQLite table name.
 *
 * Exported so seeding helpers can run direct SQL against the same table a config
 * points at, instead of re-deriving the mapping (`plans/dev-content-marking.md`).
 */
export function getTableName(source: string): string {
  // Map old JSON file paths to table names
  if (source.includes('blogPosts')) return 'blog_posts';
  if (source.includes('newsData')) return 'news_items';
  if (source.includes('writers')) return 'writers';
  if (source.includes('featuredBlogPosts')) return 'featured_blog_posts';

  // If source is already a table name, use it
  return source;
}

/**
 * Normalises the marker before it reaches SQL.
 *
 * An absent value means "this row came from the live pipeline": the column's
 * DEFAULT 'live' would produce the same result, but better-sqlite3 refuses to bind
 * `undefined`, so it is made explicit here — in one place, for every table.
 *
 * @param contentSource value from the typed row, if any.
 * @returns 'live' or 'mock'.
 */
function resolveContentSource(contentSource: string | undefined): string {
  return contentSource === MOCK_CONTENT_SOURCE ? MOCK_CONTENT_SOURCE : LIVE_CONTENT_SOURCE;
}

/**
 * Deletes the rows of one table that carry `contentSource = ?`.
 *
 * Shared by the seeder's per-table scrub and the horoscope sweep, so the column
 * name and the table mapping exist in exactly one place.
 *
 * @param db the open connection.
 * @param source table name or legacy DatabaseConfig source.
 * @param contentSource origin to delete.
 * @returns number of rows removed.
 */
export function deleteMarkedRows(
  db: ReturnType<typeof getDatabase>,
  source: string,
  contentSource: ContentSource,
): number {
  const tableName = getTableName(source);
  const result = db.prepare(`DELETE FROM ${tableName} WHERE contentSource = ?`).run(contentSource);
  return result.changes;
}

/**
 * Serializes an object to JSON string, handling undefined/null
 */
function serializeJson(value: any): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  return JSON.stringify(value);
}

/**
 * Deserializes JSON string to object, handling null
 */
function deserializeJson<T>(value: string | null): T | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return undefined;
  }
}

/**
 * Creates a post in the database
 */
export async function insert<P>(dbConfig: DatabaseConfig<P>, row: P): Promise<boolean> {
  const db = getDatabase();
  const tableName = getTableName(dbConfig.source);
  let key = await dbConfig.getKey(row);

  // Generate a key if missing (callers may build rows without one)
  if (!key || key === '') {
    key = getUniqueKey();
    // Set the key on the row object if possible
    if (typeof row === 'object' && row !== null) {
      (row as any).key = key;
    }
  }

  // Check if exists
  if (await dbConfig.exists(row)) {
    return false;
  }

  try {
    // Determine which table we're inserting into and build appropriate query
    if (tableName === 'blog_posts') {
      const article = row as any;
      const stmt = db.prepare(`
                INSERT INTO blog_posts (
                    key, title, content, author, timestamp, category, 
                    headImage, shortDescription, originalNewsItem, writerType,
                    isFeatured, featuredDate, contentSource
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
      // Provide default timestamp if missing
      const timestamp = article.timestamp || new Date().toISOString();
      // Default writerType to 'AI' if not provided
      const writerType = article.writerType || 'AI';
      // Convert boolean to integer for SQLite
      const isFeatured = article.isFeatured ? 1 : 0;

      stmt.run(
        key,
        article.title || null,
        article.content || null,
        serializeJson(article.author) || null,
        timestamp,
        article.category || null,
        article.headImage || null,
        article.shortDescription || null,
        serializeJson(article.originalNewsItem) || null,
        writerType,
        isFeatured,
        article.featuredDate || null,
        resolveContentSource(article.contentSource),
      );
    } else if (tableName === 'news_items') {
      const newsItem = row as any;
      const stmt = db.prepare(`
                INSERT INTO news_items (
                    article_id, title, description, pubDate, pubDateTZ, contentSource
                ) VALUES (?, ?, ?, ?, ?, ?)
            `);
      stmt.run(
        key,
        newsItem.title || null,
        newsItem.description || null,
        newsItem.pubDate || null,
        newsItem.pubDateTZ || null,
        resolveContentSource(newsItem.contentSource),
      );
    } else if (tableName === 'writers') {
      const writer = row as any;
      const stmt = db.prepare(`
                INSERT INTO writers (
                    key, name, description, systemPrompt, profileImage, createdAt, updatedAt,
                    contentSource
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);
      stmt.run(
        key,
        writer.name || null,
        writer.description || null,
        writer.systemPrompt || null,
        writer.profileImage || null,
        writer.createdAt || null,
        writer.updatedAt || null,
        resolveContentSource(writer.contentSource),
      );
    } else if (tableName === 'featured_blog_posts') {
      const featured = row as any;
      const stmt = db.prepare(`
                INSERT INTO featured_blog_posts (
                    key, title, content, author, timestamp, category,
                    headImage, shortDescription, originalNewsItem
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
      stmt.run(
        key,
        featured.title || null,
        serializeJson(featured.content),
        serializeJson(featured.author),
        featured.timestamp || null,
        featured.category || null,
        featured.headImage || null,
        featured.shortDescription || null,
        serializeJson(featured.originalNewsItem),
      );
    } else if (tableName === 'recipes') {
      const recipe = row as any;
      const stmt = db.prepare(`
                INSERT INTO recipes (
                    key, title, paragraphs, author, timestamp, category,
                    headImage, images, shortDescription, writerType, contentSource
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
      const timestamp = recipe.timestamp || new Date().toISOString();
      const writerType = recipe.writerType || 'AI';

      stmt.run(
        key,
        recipe.title || null,
        serializeJson(recipe.paragraphs) || null,
        serializeJson(recipe.author) || null,
        timestamp,
        recipe.category || null,
        recipe.headImage || null,
        serializeJson(recipe.images) || null,
        recipe.shortDescription || null,
        writerType,
        resolveContentSource(recipe.contentSource),
      );
    } else {
      throw new Error(`Unknown table: ${tableName}`);
    }

    return true;
  } catch (error) {
    if (error instanceof Database.SqliteError) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        // Duplicate key - already exists
        return false;
      }
      console.error('SQLite error creating row:', error.message);
    } else {
      console.error('Error creating row:', error);
    }
    return false;
  }
}

/**
 * Gets all posts from the database
 */
export async function findAll<P>(dbConfig: DatabaseConfig<P>): Promise<P[]> {
  const db = getDatabase();
  const tableName = getTableName(dbConfig.source);

  try {
    const stmt = db.prepare(`SELECT * FROM ${tableName}`);
    const rows = stmt.all() as any[];

    return rows.map((row) => {
      const post: any = {};

      if (tableName === 'blog_posts') {
        post.key = row.key;
        post.title = row.title;
        post.content = row.content;
        post.author = deserializeJson(row.author);
        post.timestamp = row.timestamp;
        post.category = row.category;
        post.headImage = row.headImage;
        post.shortDescription = row.shortDescription;
        post.originalNewsItem = deserializeJson(row.originalNewsItem);
        post.writerType = row.writerType || 'AI';
        post.isFeatured = row.isFeatured === 1 || row.isFeatured === true;
        post.featuredDate = row.featuredDate;
        post.contentSource = row.contentSource;
      } else if (tableName === 'news_items') {
        post.article_id = row.article_id;
        post.title = row.title;
        post.description = row.description;
        post.pubDate = row.pubDate;
        post.pubDateTZ = row.pubDateTZ;
        post.contentSource = row.contentSource;
      } else if (tableName === 'writers') {
        post.key = row.key;
        post.name = row.name;
        post.description = row.description;
        post.systemPrompt = row.systemPrompt;
        post.profileImage = row.profileImage;
        post.createdAt = row.createdAt;
        post.updatedAt = row.updatedAt;
        post.contentSource = row.contentSource;
      } else if (tableName === 'featured_blog_posts') {
        post.key = row.key;
        post.title = row.title;
        post.content = deserializeJson(row.content);
        post.author = deserializeJson(row.author);
        post.timestamp = row.timestamp;
        post.category = row.category;
        post.headImage = row.headImage;
        post.shortDescription = row.shortDescription;
        post.originalNewsItem = deserializeJson(row.originalNewsItem);
      }

      return post as P;
    });
  } catch (error) {
    console.error('Error getting all posts:', error);
    return [];
  }
}

/**
 * Gets the total count of posts in the database
 */
export async function count<P>(dbConfig: DatabaseConfig<P>): Promise<number> {
  const db = getDatabase();
  const tableName = getTableName(dbConfig.source);

  try {
    const stmt = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`);
    const result = stmt.get() as any;
    return result?.count || 0;
  } catch (error) {
    console.error('Error getting posts count:', error);
    return 0;
  }
}

/**
 * Counts the rows of one table that came from one origin.
 *
 * The only honest answer to "how many mock rows are in here?" — the `dev-` key
 * prefix the seeder uses is a convention, `contentSource` is a column
 * (`plans/dev-content-marking.md`).
 *
 * @param dbConfig table to count.
 * @param contentSource 'mock' for seeded/mock-adapter rows, 'live' for pipeline rows.
 */
export async function countByContentSource<P>(
  dbConfig: DatabaseConfig<P>,
  contentSource: ContentSource,
): Promise<number> {
  const db = getDatabase();
  const tableName = getTableName(dbConfig.source);

  try {
    const stmt = db.prepare(`SELECT COUNT(*) as count FROM ${tableName} WHERE contentSource = ?`);
    const result = stmt.get(contentSource) as any;
    return result?.count || 0;
  } catch (error) {
    console.error('Error counting posts by content source:', error);
    return 0;
  }
}

/**
 * Gets paginated posts from the database
 * @param dbConfig Database configuration
 * @param page Page number (1-indexed)
 * @param itemsPerPage Number of items per page
 * @param orderBy Column to order by (default: 'timestamp')
 * @param orderDirection 'ASC' or 'DESC' (default: 'DESC')
 */
export async function findPaginated<P>(
  dbConfig: DatabaseConfig<P>,
  page: number = 1,
  itemsPerPage: number = 10,
  orderBy: string = 'timestamp',
  orderDirection: 'ASC' | 'DESC' = 'DESC',
): Promise<P[]> {
  const db = getDatabase();
  const tableName = getTableName(dbConfig.source);

  try {
    // Validate and sanitize orderBy to prevent SQL injection
    const validColumns = ['timestamp', 'key', 'title', 'category'];
    const safeOrderBy = validColumns.includes(orderBy) ? orderBy : 'timestamp';
    const safeOrderDirection = orderDirection === 'ASC' ? 'ASC' : 'DESC';

    const offset = (page - 1) * itemsPerPage;
    const limit = itemsPerPage;

    const stmt = db.prepare(
      `SELECT * FROM ${tableName} ORDER BY ${safeOrderBy} ${safeOrderDirection} LIMIT ? OFFSET ?`,
    );
    const rows = stmt.all(limit, offset) as any[];

    return rows.map((row) => {
      const post: any = {};

      if (tableName === 'blog_posts') {
        post.key = row.key;
        post.title = row.title;
        post.content = row.content;
        post.author = deserializeJson(row.author);
        post.timestamp = row.timestamp;
        post.category = row.category;
        post.headImage = row.headImage;
        post.shortDescription = row.shortDescription;
        post.originalNewsItem = deserializeJson(row.originalNewsItem);
        post.writerType = row.writerType || 'AI';
        post.isFeatured = row.isFeatured === 1 || row.isFeatured === true;
        post.featuredDate = row.featuredDate;
      } else if (tableName === 'news_items') {
        post.article_id = row.article_id;
        post.title = row.title;
        post.description = row.description;
        post.pubDate = row.pubDate;
        post.pubDateTZ = row.pubDateTZ;
      } else if (tableName === 'writers') {
        post.key = row.key;
        post.name = row.name;
        post.description = row.description;
        post.systemPrompt = row.systemPrompt;
        post.profileImage = row.profileImage;
        post.createdAt = row.createdAt;
        post.updatedAt = row.updatedAt;
      } else if (tableName === 'featured_blog_posts') {
        post.key = row.key;
        post.title = row.title;
        post.content = deserializeJson(row.content);
        post.author = deserializeJson(row.author);
        post.timestamp = row.timestamp;
        post.category = row.category;
        post.headImage = row.headImage;
        post.shortDescription = row.shortDescription;
        post.originalNewsItem = deserializeJson(row.originalNewsItem);
      }

      return post as P;
    });
  } catch (error) {
    console.error('Error getting paginated posts:', error);
    return [];
  }
}

/**
 * Gets a post by its key
 */
export async function findOne<P>(dbConfig: DatabaseConfig<P>, key: string): Promise<P | undefined> {
  const db = getDatabase();
  const tableName = getTableName(dbConfig.source);

  try {
    // Determine primary key column name
    const keyColumn = tableName === 'news_items' ? 'article_id' : 'key';
    const stmt = db.prepare(`SELECT * FROM ${tableName} WHERE ${keyColumn} = ?`);
    const row = stmt.get(key) as any;

    if (!row) {
      return undefined;
    }

    const post: any = {};

    if (tableName === 'blog_posts') {
      post.key = row.key;
      post.title = row.title;
      post.content = row.content;
      post.author = deserializeJson(row.author);
      post.timestamp = row.timestamp;
      post.category = row.category;
      post.headImage = row.headImage;
      post.shortDescription = row.shortDescription;
      post.originalNewsItem = deserializeJson(row.originalNewsItem);
      post.writerType = row.writerType || 'AI';
      post.isFeatured = row.isFeatured === 1 || row.isFeatured === true;
      post.featuredDate = row.featuredDate;
      post.contentSource = row.contentSource;
    } else if (tableName === 'news_items') {
      post.article_id = row.article_id;
      post.title = row.title;
      post.description = row.description;
      post.pubDate = row.pubDate;
      post.pubDateTZ = row.pubDateTZ;
      post.contentSource = row.contentSource;
    } else if (tableName === 'writers') {
      post.key = row.key;
      post.name = row.name;
      post.description = row.description;
      post.systemPrompt = row.systemPrompt;
      post.profileImage = row.profileImage;
      post.createdAt = row.createdAt;
      post.updatedAt = row.updatedAt;
      post.contentSource = row.contentSource;
    } else if (tableName === 'featured_blog_posts') {
      post.key = row.key;
      post.title = row.title;
      post.content = deserializeJson(row.content);
      post.author = deserializeJson(row.author);
      post.timestamp = row.timestamp;
      post.category = row.category;
      post.headImage = row.headImage;
      post.shortDescription = row.shortDescription;
      post.originalNewsItem = deserializeJson(row.originalNewsItem);
    }

    return post as P;
  } catch (error) {
    console.error('Error getting post by key:', error);
    return undefined;
  }
}

/**
 * Updates a post in the database
 */
export async function update<P>(dbConfig: DatabaseConfig<P>, row: P): Promise<boolean> {
  const db = getDatabase();
  const tableName = getTableName(dbConfig.source);
  const key = await dbConfig.getKey(row);

  // Check if the row exists
  const existingRow = await dbConfig.find(key);
  if (!existingRow) {
    return false;
  }

  try {
    // Copy values onto the row that was read
    dbConfig.copyValues(row, existingRow);

    // Update in database
    if (tableName === 'blog_posts') {
      const article = existingRow as any;
      const stmt = db.prepare(`
                UPDATE blog_posts SET
                    title = ?, content = ?, author = ?, timestamp = ?, category = ?,
                    headImage = ?, shortDescription = ?, originalNewsItem = ?, writerType = ?,
                    isFeatured = ?, featuredDate = ?
                WHERE key = ?
            `);
      // Default writerType to 'AI' if not provided
      const writerType = article.writerType || 'AI';
      // Convert boolean to integer for SQLite
      const isFeatured = article.isFeatured ? 1 : 0;
      stmt.run(
        article.title || null,
        article.content || null,
        serializeJson(article.author),
        article.timestamp || null,
        article.category || null,
        article.headImage || null,
        article.shortDescription || null,
        serializeJson(article.originalNewsItem),
        writerType,
        isFeatured,
        article.featuredDate || null,
        key,
      );
    } else if (tableName === 'news_items') {
      const newsItem = existingRow as any;
      const stmt = db.prepare(`
                UPDATE news_items SET
                    title = ?, description = ?, pubDate = ?, pubDateTZ = ?
                WHERE article_id = ?
            `);
      stmt.run(
        newsItem.title || null,
        newsItem.description || null,
        newsItem.pubDate || null,
        newsItem.pubDateTZ || null,
        key,
      );
    } else if (tableName === 'writers') {
      const writer = existingRow as any;
      const stmt = db.prepare(`
                UPDATE writers SET
                    name = ?, description = ?, systemPrompt = ?, profileImage = ?,
                    createdAt = ?, updatedAt = ?
                WHERE key = ?
            `);
      stmt.run(
        writer.name || null,
        writer.description || null,
        writer.systemPrompt || null,
        writer.profileImage || null,
        writer.createdAt || null,
        writer.updatedAt || null,
        key,
      );
    } else if (tableName === 'featured_blog_posts') {
      const featured = existingRow as any;
      const stmt = db.prepare(`
                UPDATE featured_blog_posts SET
                    title = ?, content = ?, author = ?, timestamp = ?, category = ?,
                    headImage = ?, shortDescription = ?, originalNewsItem = ?
                WHERE key = ?
            `);
      stmt.run(
        featured.title || null,
        serializeJson(featured.content),
        serializeJson(featured.author),
        featured.timestamp || null,
        featured.category || null,
        featured.headImage || null,
        featured.shortDescription || null,
        serializeJson(featured.originalNewsItem),
        key,
      );
    } else if (tableName === 'recipes') {
      const recipe = existingRow as any;
      const stmt = db.prepare(`
                UPDATE recipes SET
                    title = ?, paragraphs = ?, author = ?, timestamp = ?, category = ?,
                    headImage = ?, images = ?, shortDescription = ?, writerType = ?
                WHERE key = ?
            `);
      // Same defaults as the INSERT branch: a recipe written without these would
      // come back with different values than it went in with.
      const writerType = recipe.writerType || 'AI';
      stmt.run(
        recipe.title || null,
        serializeJson(recipe.paragraphs) || null,
        serializeJson(recipe.author) || null,
        recipe.timestamp || new Date().toISOString(),
        recipe.category || null,
        recipe.headImage || null,
        serializeJson(recipe.images) || null,
        recipe.shortDescription || null,
        writerType,
        key,
      );
    } else {
      // Unhandled table used to fall through to `return true`, reporting a write
      // that never happened. Every content table must have a branch above.
      throw new Error(`update: no UPDATE statement for table '${tableName}'`);
    }

    return true;
  } catch (error) {
    console.error('Error updating row:', error);
    return false;
  }
}

/**
 * Deletes a post from the database
 */
export async function remove<P>(dbConfig: DatabaseConfig<P>, key: string): Promise<boolean> {
  const db = getDatabase();
  const tableName = getTableName(dbConfig.source);

  try {
    // Determine primary key column name
    const keyColumn = tableName === 'news_items' ? 'article_id' : 'key';
    const stmt = db.prepare(`DELETE FROM ${tableName} WHERE ${keyColumn} = ?`);
    const result = stmt.run(key);

    // Check if any row was deleted
    return result.changes > 0;
  } catch (error) {
    console.error('Error removing row:', error);
    return false;
  }
}
