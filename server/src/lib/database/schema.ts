import { getDatabase } from './database.js';

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
            author TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            category TEXT,
            headImage TEXT,
            shortDescription TEXT,
            originalNewsItem TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

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
            content TEXT NOT NULL,
            author TEXT NOT NULL,
            timestamp TEXT NOT NULL,
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

    console.log('SQLite schema initialized successfully');
}

