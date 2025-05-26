import { JSONFilePreset } from 'lowdb/node'
import { DB_BLOG_POST_FILE, DB_NEWS_DATA_FILE } from "../../config/constants";
import { NewsItem } from "../../services/newsService.js";
import { ArticleScheme } from "../../types/article.js";
import { Schema } from "./lowdbOperations.js";

// Configuration for a database that holds data of type P
export interface DatabaseConfig<P> {
  // Place of database file 
  source: string;
  // Returns true if pInput exists in database file
  exists: (pInput: P) => Promise<boolean>;
  // Returns P from database that corresponds to input key
  find: (key: string) => Promise<P | null | undefined>;
};

export const blogDatabaseConfig: DatabaseConfig<ArticleScheme> = {
    source: DB_BLOG_POST_FILE,
    exists: async (article: ArticleScheme) => {
        const db = await JSONFilePreset<Schema<ArticleScheme>>(DB_BLOG_POST_FILE, { posts: [] });
        return db.data.posts.some(p => p.key === article.key)
    },
    find: async (key: string) => {
        const db = await JSONFilePreset<Schema<ArticleScheme>>(DB_BLOG_POST_FILE, { posts: [] });
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