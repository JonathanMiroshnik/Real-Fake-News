import { getDatabase } from './database.js';
import { debugLog, debugWarn } from '../../utils/debugLogger.js';

/**
 * Column added by the content-marking migration
 * (`plans/dev-content-marking.md` Phase A).
 *
 * 'live' is stamped by the column default, so the existing write paths need no
 * change; mock code sources stamp 'mock' explicitly. It is metadata, not a
 * filter: nothing reads it for ranking or selection yet.
 */
const CONTENT_SOURCE_COLUMN = "contentSource TEXT NOT NULL DEFAULT 'live'";

/**
 * Tables that carry the `contentSource` marker.
 *
 * `foods` is absent on purpose: a food row is only a name fed into a recipe
 * prompt, and the seeder deletes exactly the names it wrote. `featured_blog_posts`
 * is absent too — the table is dead (see `plans/featured-articles.md`), and
 * `blog_posts.contentSource` already describes the article it would duplicate.
 */
const CONTENT_SOURCE_TABLES = [
  'blog_posts',
  'news_items',
  'writers',
  'recipes',
  'horoscopes',
] as const;

/**
 * Adds the `contentSource` marker to an existing table.
 *
 * SQLite has no `ADD COLUMN IF NOT EXISTS`, so the second and later runs land in
 * the `duplicate column name` branch and are ignored — the same swallow pattern
 * used below for `writerType`, `isFeatured` and `featuredDate`.
 *
 * @param db the open connection.
 * @param tableName table that already exists (new tables declare the column inline).
 */
function addContentSourceColumn(db: ReturnType<typeof getDatabase>, tableName: string): void {
  try {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${CONTENT_SOURCE_COLUMN}`);
  } catch (error: any) {
    const isDuplicateColumn =
      error.code === 'SQLITE_ERROR' &&
      (error.message?.includes('duplicate column name') ||
        error.message?.includes('duplicate column'));

    if (!isDuplicateColumn) {
      debugWarn(`Warning: Could not add contentSource column to ${tableName}:`, error.message);
    }
  }
}

/**
 * Initializes the SQLite database schema.
 * Creates all tables and indexes if they don't exist.
 * Safe to call multiple times - won't modify existing tables or data.
 */
export function initializeSchema(): void {
  const db = getDatabase();

  // Blog Posts Table
  // Stores regular blog articles (ArticleScheme)
  db.exec(`
        CREATE TABLE IF NOT EXISTS blog_posts (
            key TEXT PRIMARY KEY,
            title TEXT,
            content TEXT,
            author TEXT,
            timestamp TEXT,
            category TEXT,
            headImage TEXT,
            shortDescription TEXT,
            originalNewsItem TEXT,
            writerType TEXT DEFAULT 'AI',
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            ${CONTENT_SOURCE_COLUMN}
        )
    `);

  // Migration: Add writerType column to existing blog_posts table if it doesn't exist
  try {
    db.exec(`
            ALTER TABLE blog_posts 
            ADD COLUMN writerType TEXT DEFAULT 'AI'
        `);
    // If column was just added, update existing rows to have 'AI' as default
    db.exec(`
            UPDATE blog_posts 
            SET writerType = 'AI' 
            WHERE writerType IS NULL
        `);
  } catch (error: any) {
    // Column already exists, ignore error
    // SQLite error codes: SQLITE_ERROR (1) for duplicate column
    if (
      error.code !== 'SQLITE_ERROR' &&
      !error.message?.includes('duplicate column name') &&
      !error.message?.includes('duplicate column')
    ) {
      debugWarn('Warning: Could not add writerType column:', error.message);
    } else {
      // Column exists, just ensure all rows have a value
      db.exec(`
                UPDATE blog_posts 
                SET writerType = 'AI' 
                WHERE writerType IS NULL
            `);
    }
  }

  // Migration: Add isFeatured column to existing blog_posts table if it doesn't exist
  try {
    db.exec(`
            ALTER TABLE blog_posts 
            ADD COLUMN isFeatured INTEGER DEFAULT 0
        `);
  } catch (error: any) {
    // Column already exists, ignore error
    if (
      error.code !== 'SQLITE_ERROR' &&
      !error.message?.includes('duplicate column name') &&
      !error.message?.includes('duplicate column')
    ) {
      debugWarn('Warning: Could not add isFeatured column:', error.message);
    }
  }

  // Migration: Add featuredDate column to existing blog_posts table if it doesn't exist
  try {
    db.exec(`
            ALTER TABLE blog_posts 
            ADD COLUMN featuredDate TEXT
        `);
  } catch (error: any) {
    // Column already exists, ignore error
    if (
      error.code !== 'SQLITE_ERROR' &&
      !error.message?.includes('duplicate column name') &&
      !error.message?.includes('duplicate column')
    ) {
      debugWarn('Warning: Could not add featuredDate column:', error.message);
    }
  }

  // News Items Table
  // Stores news articles fetched from external APIs (NewsItem)
  db.exec(`
        CREATE TABLE IF NOT EXISTS news_items (
            article_id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            pubDate TEXT NOT NULL,
            pubDateTZ TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            ${CONTENT_SOURCE_COLUMN}
        )
    `);

  // Writers Table
  // Stores writer profiles (Writer)
  db.exec(`
        CREATE TABLE IF NOT EXISTS writers (
            key TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            systemPrompt TEXT NOT NULL,
            profileImage TEXT,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL,
            ${CONTENT_SOURCE_COLUMN}
        )
    `);

  // Featured Blog Posts Table
  // Stores featured articles with multiple authors and sub-articles (FeaturedArticleScheme)
  db.exec(`
        CREATE TABLE IF NOT EXISTS featured_blog_posts (
            key TEXT PRIMARY KEY,
            title TEXT,
            content TEXT,
            author TEXT,
            timestamp TEXT,
            category TEXT,
            headImage TEXT,
            shortDescription TEXT,
            originalNewsItem TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

  // Create indexes for frequently queried columns
  // Index on timestamp for date-based queries (getAllPostsAfterDate)
  db.exec(`
        CREATE INDEX IF NOT EXISTS idx_blog_posts_timestamp 
        ON blog_posts(timestamp)
    `);

  // Index on pubDate for news item date filtering
  db.exec(`
        CREATE INDEX IF NOT EXISTS idx_news_items_pubDate 
        ON news_items(pubDate)
    `);

  // Index on category for potential category-based queries
  db.exec(`
        CREATE INDEX IF NOT EXISTS idx_blog_posts_category 
        ON blog_posts(category)
    `);

  // Index on featured posts timestamp
  db.exec(`
        CREATE INDEX IF NOT EXISTS idx_featured_blog_posts_timestamp 
        ON featured_blog_posts(timestamp)
    `);

  // Foods Table
  // Stores random food names for recipe generation
  db.exec(`
        CREATE TABLE IF NOT EXISTS foods (
            name TEXT PRIMARY KEY
        )
    `);

  // Recipes Table
  // Stores recipe articles (RecipeScheme)
  db.exec(`
        CREATE TABLE IF NOT EXISTS recipes (
            key TEXT PRIMARY KEY,
            title TEXT,
            paragraphs TEXT,
            author TEXT,
            timestamp TEXT,
            category TEXT,
            headImage TEXT,
            images TEXT,
            shortDescription TEXT,
            writerType TEXT DEFAULT 'AI',
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            ${CONTENT_SOURCE_COLUMN}
        )
    `);

  // Index on recipes timestamp
  db.exec(`
        CREATE INDEX IF NOT EXISTS idx_recipes_timestamp 
        ON recipes(timestamp)
    `);

  // Horoscopes Table
  // Stores daily horoscopes for each zodiac sign
  db.exec(`
        CREATE TABLE IF NOT EXISTS horoscopes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            zodiacSign TEXT NOT NULL,
            content TEXT NOT NULL,
            astrologicalData TEXT NOT NULL,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            ${CONTENT_SOURCE_COLUMN},
            UNIQUE(date, zodiacSign)
        )
    `);

  // Index on horoscope date for date-based queries
  db.exec(`
        CREATE INDEX IF NOT EXISTS idx_horoscopes_date 
        ON horoscopes(date)
    `);

  // Site Configuration Table
  // Stores key-value pairs for site-wide configuration settings
  // Managed through the admin panel's Configuration page
  db.exec(`
        CREATE TABLE IF NOT EXISTS site_config (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            description TEXT,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

  // Migration: add the contentSource marker to databases created before it
  // existed (plans/dev-content-marking.md Phase A). Existing rows backfill to
  // 'live' through the column default — which is wrong for anything seeded before
  // this lands, so a dev database that predates it should be rebuilt once with
  // `npm run seed:reset`. Runs after the CREATEs so every target table exists.
  for (const tableName of CONTENT_SOURCE_TABLES) {
    addContentSourceColumn(db, tableName);
  }

  // Index on origin, so "how many mock rows?" is a real COUNT(*) in every table
  // instead of a LIKE 'dev-%' guess.
  for (const tableName of CONTENT_SOURCE_TABLES) {
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_${tableName}_contentSource 
        ON ${tableName}(contentSource)
    `);
  }

  debugLog('SQLite schema initialized successfully');
}
