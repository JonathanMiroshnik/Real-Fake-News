"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writerDatabaseConfig = exports.newsDatabaseConfig = exports.featuredBlogDatabaseConfig = exports.blogDatabaseConfig = void 0;
const database_js_1 = require("../database/database.js");
const constants_1 = require("../../config/constants");
;
// TODO: copyValues never returns false under these circumstances!
exports.blogDatabaseConfig = {
    source: constants_1.DB_BLOG_POST_FILE,
    exists: async (article) => {
        const db = (0, database_js_1.getDatabase)();
        const key = article.key;
        if (!key)
            return false;
        const stmt = db.prepare('SELECT 1 FROM blog_posts WHERE key = ?');
        const result = stmt.get(key);
        return result !== undefined;
    },
    find: async (key) => {
        const db = (0, database_js_1.getDatabase)();
        const stmt = db.prepare('SELECT * FROM blog_posts WHERE key = ?');
        const row = stmt.get(key);
        if (!row)
            return undefined;
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
        };
    },
    getKey: async (pInput) => {
        if (pInput.key === undefined) {
            return "";
        }
        return pInput.key;
    },
    copyValues: (fromInput, toInput) => {
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
exports.featuredBlogDatabaseConfig = {
    source: constants_1.DB_FEATURED_BLOG_POST_FILE,
    exists: async (article) => {
        const db = (0, database_js_1.getDatabase)();
        const key = article.key;
        if (!key)
            return false;
        const stmt = db.prepare('SELECT 1 FROM featured_blog_posts WHERE key = ?');
        const result = stmt.get(key);
        return result !== undefined;
    },
    find: async (key) => {
        const db = (0, database_js_1.getDatabase)();
        const stmt = db.prepare('SELECT * FROM featured_blog_posts WHERE key = ?');
        const row = stmt.get(key);
        if (!row)
            return undefined;
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
        };
    },
    getKey: async (pInput) => {
        if (pInput.key === undefined) {
            return "";
        }
        return pInput.key;
    },
    copyValues: (fromInput, toInput) => {
        toInput.key = fromInput.key;
        toInput.category = fromInput.category;
        toInput.author = [];
        if (fromInput.author !== undefined) {
            for (const w of fromInput.author) {
                toInput.author.push({ ...w });
            }
        }
        toInput.content = [];
        if (fromInput.content !== undefined) {
            for (const w of fromInput.content) {
                toInput.content.push({ ...w });
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
exports.newsDatabaseConfig = {
    source: constants_1.DB_NEWS_DATA_FILE,
    exists: async (article) => {
        const db = (0, database_js_1.getDatabase)();
        const stmt = db.prepare('SELECT 1 FROM news_items WHERE article_id = ?');
        const result = stmt.get(article.article_id);
        return result !== undefined;
    },
    find: async (key) => {
        const db = (0, database_js_1.getDatabase)();
        const stmt = db.prepare('SELECT * FROM news_items WHERE article_id = ?');
        const row = stmt.get(key);
        if (!row)
            return undefined;
        return {
            article_id: row.article_id,
            title: row.title,
            description: row.description,
            pubDate: row.pubDate,
            pubDateTZ: row.pubDateTZ
        };
    },
    getKey: async (pInput) => {
        return pInput.article_id;
    },
    copyValues: (fromInput, toInput) => {
        toInput.article_id = fromInput.article_id;
        toInput.description = fromInput.description;
        toInput.title = fromInput.title;
        return true;
    }
};
exports.writerDatabaseConfig = {
    source: constants_1.DB_WRITERS_FILE,
    exists: async (article) => {
        const db = (0, database_js_1.getDatabase)();
        const key = article.key;
        if (!key)
            return false;
        const stmt = db.prepare('SELECT 1 FROM writers WHERE key = ?');
        const result = stmt.get(key);
        return result !== undefined;
    },
    find: async (key) => {
        const db = (0, database_js_1.getDatabase)();
        const stmt = db.prepare('SELECT * FROM writers WHERE key = ?');
        const row = stmt.get(key);
        if (!row)
            return undefined;
        return {
            key: row.key,
            name: row.name,
            description: row.description,
            systemPrompt: row.systemPrompt,
            profileImage: row.profileImage,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        };
    },
    getKey: async (pInput) => {
        if (pInput.key === undefined) {
            return "";
        }
        return pInput.key;
    },
    copyValues: (fromInput, toInput) => {
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
//# sourceMappingURL=databaseConfigurations.js.map