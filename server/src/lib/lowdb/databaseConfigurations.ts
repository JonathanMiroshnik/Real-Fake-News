import { JSONFilePreset } from 'lowdb/node'
import { DB_BLOG_POST_FILE, DB_NEWS_DATA_FILE, DB_WRITERS_FILE, DB_FEATURED_BLOG_POST_FILE } from "../../config/constants";
import { NewsItem } from "../../services/newsService.js";
import { ArticleScheme, FeaturedArticleScheme } from "../../types/article.js";
import { Schema } from "./lowdbOperations.js";
import { Writer } from '../../types/writer';

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
        const db = await JSONFilePreset<Schema<ArticleScheme>>(DB_BLOG_POST_FILE, { posts: [] });
        return db.data.posts.some(p => p.key === article.key)
    },
    find: async (key: string) => {
        const db = await JSONFilePreset<Schema<ArticleScheme>>(DB_BLOG_POST_FILE, { posts: [] });
        return db.data.posts.find(p => p.key === key);
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
        const db = await JSONFilePreset<Schema<FeaturedArticleScheme>>(DB_FEATURED_BLOG_POST_FILE, { posts: [] });
        return db.data.posts.some(p => p.key === article.key)
    },
    find: async (key: string) => {
        const db = await JSONFilePreset<Schema<FeaturedArticleScheme>>(DB_FEATURED_BLOG_POST_FILE, { posts: [] });
        return db.data.posts.find(p => p.key === key);
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
        const db = await JSONFilePreset<Schema<NewsItem>>(DB_NEWS_DATA_FILE, { posts: [] });
        return db.data.posts.some(p => p.article_id === article.article_id)
    },
    find: async (key: string) => {
        const db = await JSONFilePreset<Schema<NewsItem>>(DB_NEWS_DATA_FILE, { posts: [] });
        return db.data.posts.find(p => p.article_id === key);
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
        const db = await JSONFilePreset<Schema<Writer>>(DB_WRITERS_FILE, { posts: [] });
        return db.data.posts.some(p => p.key === article.key)
    },
    find: async (key: string) => {
        const db = await JSONFilePreset<Schema<Writer>>(DB_WRITERS_FILE, { posts: [] });
        return db.data.posts.find(p => p.key === key);
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