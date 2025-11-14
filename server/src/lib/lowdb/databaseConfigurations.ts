import { getDatabase } from '../database/database.js';
import { DB_BLOG_POST_FILE, DB_NEWS_DATA_FILE, DB_WRITERS_FILE, DB_FEATURED_BLOG_POST_FILE } from "../../config/constants";
import { NewsItem } from "../../services/newsService.js";
import { ArticleScheme, FeaturedArticleScheme } from "../../types/article.js";
import { Writer } from '../../types/writer';
import Database from 'better-sqlite3';

// Configuration for a database that holds data of type P
export interface DatabaseConfig<P> {
  // Place of database file 
  source: string;
  // Returns true if pInput exists in database file
  exists: (pInput: P) => Promise<boolean>;
  // Returns P from database that corresponds to input key
  find: (key: string) => Promise<P | undefined>;
  // Gets the key of the input P type value
  getKey: (pInput: P) => Promise<string>;
  // Copies the values from one P type value input to another
  copyValues: (fromInput: P, toInput: P) => boolean;
};

// TODO: copyValues never returns false under these circumstances!

export const blogDatabaseConfig: DatabaseConfig<ArticleScheme> = {
    source: DB_BLOG_POST_FILE,
    exists: async (article: ArticleScheme) => {
        const db = getDatabase();
        const key = article.key;
        if (!key) return false;
        const stmt = db.prepare('SELECT 1 FROM blog_posts WHERE key = ?');
        const result = stmt.get(key);
        return result !== undefined;
    },
    find: async (key: string) => {
        const db = getDatabase();
        const stmt = db.prepare('SELECT * FROM blog_posts WHERE key = ?');
        const row = stmt.get(key) as any;
        if (!row) return undefined;
        
        return {
            key: row.key,
            title: row.title,
            content: row.content,
            author: row.author ? JSON.parse(row.author) : undefined,
            timestamp: row.timestamp,
            category: row.category,
            headImage: row.headImage,
            shortDescription: row.shortDescription,
            originalNewsItem: row.originalNewsItem ? JSON.parse(row.originalNewsItem) : undefined
        } as ArticleScheme;
    },
    getKey: async (pInput: ArticleScheme) => {
        if (pInput.key === undefined) {
            return "";
        }

        return pInput.key;
    },
    copyValues: (fromInput: ArticleScheme, toInput: ArticleScheme) => {
        toInput.key = fromInput.key;
        toInput.author = fromInput.author;
        toInput.category = fromInput.category;
        toInput.content = fromInput.content;
        toInput.headImage = fromInput.headImage;
        toInput.originalNewsItem = fromInput.originalNewsItem;
        toInput.shortDescription = fromInput.shortDescription;
        toInput.timestamp = fromInput.timestamp;
        toInput.title = fromInput.title;

        return true;
    }
};

export const featuredBlogDatabaseConfig: DatabaseConfig<FeaturedArticleScheme> = {
    source: DB_FEATURED_BLOG_POST_FILE,
    exists: async (article: FeaturedArticleScheme) => {
        const db = getDatabase();
        const key = article.key;
        if (!key) return false;
        const stmt = db.prepare('SELECT 1 FROM featured_blog_posts WHERE key = ?');
        const result = stmt.get(key);
        return result !== undefined;
    },
    find: async (key: string) => {
        const db = getDatabase();
        const stmt = db.prepare('SELECT * FROM featured_blog_posts WHERE key = ?');
        const row = stmt.get(key) as any;
        if (!row) return undefined;
        
        return {
            key: row.key,
            title: row.title,
            content: row.content ? JSON.parse(row.content) : undefined,
            author: row.author ? JSON.parse(row.author) : undefined,
            timestamp: row.timestamp,
            category: row.category,
            headImage: row.headImage,
            shortDescription: row.shortDescription,
            originalNewsItem: row.originalNewsItem ? JSON.parse(row.originalNewsItem) : undefined
        } as FeaturedArticleScheme;
    },
    getKey: async (pInput: FeaturedArticleScheme) => {
        if (pInput.key === undefined) {
            return "";
        }

        return pInput.key;
    },
    copyValues: (fromInput: FeaturedArticleScheme, toInput: FeaturedArticleScheme) => {
        toInput.key = fromInput.key;        
        toInput.category = fromInput.category;

        toInput.author = [];
        if (fromInput.author !== undefined) {
            for (const w of fromInput.author) {
                toInput.author.push({...w});
            }
        }
        
        toInput.content = [];
        if (fromInput.content !== undefined) {
            for (const w of fromInput.content) {
                toInput.content.push({...w});
            }
        }

        toInput.headImage = fromInput.headImage;
        toInput.originalNewsItem = fromInput.originalNewsItem;
        toInput.shortDescription = fromInput.shortDescription;
        toInput.timestamp = fromInput.timestamp;
        toInput.title = fromInput.title;

        return true;
    }
};

export const newsDatabaseConfig: DatabaseConfig<NewsItem> = {
    source: DB_NEWS_DATA_FILE,
    exists: async (article: NewsItem) => {
        const db = getDatabase();
        const stmt = db.prepare('SELECT 1 FROM news_items WHERE article_id = ?');
        const result = stmt.get(article.article_id);
        return result !== undefined;
    },
    find: async (key: string) => {
        const db = getDatabase();
        const stmt = db.prepare('SELECT * FROM news_items WHERE article_id = ?');
        const row = stmt.get(key) as any;
        if (!row) return undefined;
        
        return {
            article_id: row.article_id,
            title: row.title,
            description: row.description,
            pubDate: row.pubDate,
            pubDateTZ: row.pubDateTZ
        } as NewsItem;
    },
    getKey: async (pInput: NewsItem) => {
        return pInput.article_id;
    },
    copyValues: (fromInput: NewsItem, toInput: NewsItem) => {
        toInput.article_id = fromInput.article_id;
        toInput.description = fromInput.description;
        toInput.title = fromInput.title;

        return true;
    }
};

export const writerDatabaseConfig: DatabaseConfig<Writer> = {
    source: DB_WRITERS_FILE,
    exists: async (article: Writer) => {
        const db = getDatabase();
        const key = article.key;
        if (!key) return false;
        const stmt = db.prepare('SELECT 1 FROM writers WHERE key = ?');
        const result = stmt.get(key);
        return result !== undefined;
    },
    find: async (key: string) => {
        const db = getDatabase();
        const stmt = db.prepare('SELECT * FROM writers WHERE key = ?');
        const row = stmt.get(key) as any;
        if (!row) return undefined;
        
        return {
            key: row.key,
            name: row.name,
            description: row.description,
            systemPrompt: row.systemPrompt,
            profileImage: row.profileImage,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        } as Writer;
    },
    getKey: async (pInput: Writer) => {
        if (pInput.key === undefined) {
            return "";
        }

        return pInput.key;
    },
    copyValues: (fromInput: Writer, toInput: Writer) => {
        toInput.key = fromInput.key;
        toInput.name = fromInput.name;
        toInput.description = fromInput.description;
        toInput.systemPrompt = fromInput.systemPrompt;
        toInput.profileImage = fromInput.profileImage;
        toInput.createdAt = fromInput.createdAt;
        toInput.updatedAt = fromInput.updatedAt;

        return true;
    }
};