import { getDatabase } from './database.js';
import { debugLog, debugWarn } from '../../utils/debugLogger.js';

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
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
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
        if (error.code !== 'SQLITE_ERROR' && !error.message?.includes('duplicate column name') && !error.message?.includes('duplicate column')) {
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

    // News Items Table
    // Stores news articles fetched from external APIs (NewsItem)
    db.exec(`
        CREATE TABLE IF NOT EXISTS news_items (
            article_id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            pubDate TEXT NOT NULL,
            pubDateTZ TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
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
            updatedAt TEXT NOT NULL
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
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Index on recipes timestamp
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_recipes_timestamp 
        ON recipes(timestamp)
    `);

    debugLog('SQLite schema initialized successfully');
}

