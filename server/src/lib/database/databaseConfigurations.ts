import { getDatabase } from './database.js';
import { ArticleScheme, FeaturedArticleScheme, RecipeScheme } from "../../types/article.js";
import { NewsItem } from "../../services/newsService.js";
import { Writer } from '../../types/writer.js';

// Configuration for a database that holds data of type P
// This interface is used by sqliteOperations to work with different table types
export interface DatabaseConfig<P> {
  // Source identifier (kept for compatibility, but not used for file paths anymore)
  source: string;
  // Returns true if pInput exists in database
  exists: (pInput: P) => Promise<boolean>;
  // Returns P from database that corresponds to input key
  find: (key: string) => Promise<P | undefined>;
  // Gets the key of the input P type value
  getKey: (pInput: P) => Promise<string>;
  // Copies the values from one P type value input to another
  copyValues: (fromInput: P, toInput: P) => boolean;
};

export const blogDatabaseConfig: DatabaseConfig<ArticleScheme> = {
    source: "blog_posts",
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
            originalNewsItem: row.originalNewsItem ? JSON.parse(row.originalNewsItem) : undefined,
            writerType: row.writerType || 'AI',
            isFeatured: row.isFeatured === 1 || row.isFeatured === true,
            featuredDate: row.featuredDate
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
        toInput.writerType = fromInput.writerType || 'AI';
        toInput.isFeatured = fromInput.isFeatured;
        toInput.featuredDate = fromInput.featuredDate;

        return true;
    }
};

export const featuredBlogDatabaseConfig: DatabaseConfig<FeaturedArticleScheme> = {
    source: "featured_blog_posts",
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
    source: "news_items",
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
    source: "writers",
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

export const recipeDatabaseConfig: DatabaseConfig<RecipeScheme> = {
    source: "recipes",
    exists: async (recipe: RecipeScheme) => {
        const db = getDatabase();
        const key = recipe.key;
        if (!key) return false;
        const stmt = db.prepare('SELECT 1 FROM recipes WHERE key = ?');
        const result = stmt.get(key);
        return result !== undefined;
    },
    find: async (key: string) => {
        const db = getDatabase();
        const stmt = db.prepare('SELECT * FROM recipes WHERE key = ?');
        const row = stmt.get(key) as any;
        if (!row) return undefined;
        
        return {
            key: row.key,
            title: row.title,
            paragraphs: row.paragraphs ? JSON.parse(row.paragraphs) : undefined,
            author: row.author ? JSON.parse(row.author) : undefined,
            timestamp: row.timestamp,
            category: row.category,
            headImage: row.headImage,
            images: row.images ? JSON.parse(row.images) : undefined,
            shortDescription: row.shortDescription,
            writerType: row.writerType || 'AI'
        } as RecipeScheme;
    },
    getKey: async (pInput: RecipeScheme) => {
        if (pInput.key === undefined) {
            return "";
        }

        return pInput.key;
    },
    copyValues: (fromInput: RecipeScheme, toInput: RecipeScheme) => {
        toInput.key = fromInput.key;
        toInput.author = fromInput.author;
        toInput.category = fromInput.category;
        toInput.paragraphs = fromInput.paragraphs;
        toInput.headImage = fromInput.headImage;
        toInput.images = fromInput.images;
        toInput.shortDescription = fromInput.shortDescription;
        toInput.timestamp = fromInput.timestamp;
        toInput.title = fromInput.title;
        toInput.writerType = fromInput.writerType || 'AI';

        return true;
    }
};

