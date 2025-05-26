"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogDatabaseConfig = void 0;
const node_1 = require("lowdb/node");
const constants_1 = require("../../config/constants");
;
exports.blogDatabaseConfig = {
    source: constants_1.DB_BLOG_POST_FILE,
    exists: async (article) => {
        const db = await (0, node_1.JSONFilePreset)(constants_1.DB_BLOG_POST_FILE, { posts: [] });
        return db.data.posts.some(p => p.key === article.key);
    },
    find: async (key) => {
        const db = await (0, node_1.JSONFilePreset)(constants_1.DB_BLOG_POST_FILE, { posts: [] });
        return db.data.posts.find(p => p.key === key);
    }
};
// export const newsDatabaseConfig: DatabaseConfig<NewsItem> = {
//     source: DB_BLOG_POST_FILE,
//     exists: async (article: ArticleScheme) => {
//         const db = await JSONFilePreset<Schema<ArticleScheme>>(DB_BLOG_POST_FILE, { posts: [] });
//         return db.data.posts.some(p => p.key === article.key)
//     },
//     find: async (key: string) => {
//         const db = await JSONFilePreset<Schema<ArticleScheme>>(DB_BLOG_POST_FILE, { posts: [] });
//         return db.data.posts.find(p => p.key === key);
//     }
// };
//# sourceMappingURL=databaseConfigurations.js.map