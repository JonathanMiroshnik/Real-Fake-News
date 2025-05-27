"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writerDatabaseConfig = exports.newsDatabaseConfig = exports.blogDatabaseConfig = void 0;
const node_1 = require("lowdb/node");
const constants_1 = require("../../config/constants");
;
// TODO: copyValues never returns false under these circumstances!
exports.blogDatabaseConfig = {
    source: constants_1.DB_BLOG_POST_FILE,
    exists: async (article) => {
        const db = await (0, node_1.JSONFilePreset)(constants_1.DB_BLOG_POST_FILE, { posts: [] });
        return db.data.posts.some(p => p.key === article.key);
    },
    find: async (key) => {
        const db = await (0, node_1.JSONFilePreset)(constants_1.DB_BLOG_POST_FILE, { posts: [] });
        return db.data.posts.find(p => p.key === key);
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
exports.newsDatabaseConfig = {
    source: constants_1.DB_NEWS_DATA_FILE,
    exists: async (article) => {
        const db = await (0, node_1.JSONFilePreset)(constants_1.DB_NEWS_DATA_FILE, { posts: [] });
        return db.data.posts.some(p => p.article_id === article.article_id);
    },
    find: async (key) => {
        const db = await (0, node_1.JSONFilePreset)(constants_1.DB_NEWS_DATA_FILE, { posts: [] });
        return db.data.posts.find(p => p.article_id === key);
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
        const db = await (0, node_1.JSONFilePreset)(constants_1.DB_WRITERS_FILE, { posts: [] });
        return db.data.posts.some(p => p.key === article.key);
    },
    find: async (key) => {
        const db = await (0, node_1.JSONFilePreset)(constants_1.DB_WRITERS_FILE, { posts: [] });
        return db.data.posts.find(p => p.key === key);
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