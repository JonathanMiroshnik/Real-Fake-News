import { getDatabase } from './database.js';
import { DatabaseConfig } from './databaseConfigurations.js';
import Database from 'better-sqlite3';
import { getUniqueKey } from '../../utils/general.js';

// Every type of post has a unique key property
export interface Post {
  key: string | undefined;
}

/**
 * Maps DatabaseConfig source (table name) to actual SQLite table name
 */
function getTableName(source: string): string {
    // Map old JSON file paths to table names
    if (source.includes('blogPosts')) return 'blog_posts';
    if (source.includes('newsData')) return 'news_items';
    if (source.includes('writers')) return 'writers';
    if (source.includes('featuredBlogPosts')) return 'featured_blog_posts';
    
    // If source is already a table name, use it
    return source;
}

/**
 * Serializes an object to JSON string, handling undefined/null
 */
function serializeJson(value: any): string | null {
    if (value === undefined || value === null) {
        return null;
    }
    return JSON.stringify(value);
}

/**
 * Deserializes JSON string to object, handling null
 */
function deserializeJson<T>(value: string | null): T | undefined {
    if (value === null || value === undefined) {
        return undefined;
    }
    try {
        return JSON.parse(value) as T;
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return undefined;
    }
}

/**
 * Creates a post in the database
 */
export async function createPost<P>(post: P, dbConfig: DatabaseConfig<P>): Promise<boolean> {
    const db = getDatabase();
    const tableName = getTableName(dbConfig.source);
    let key = await dbConfig.getKey(post);

    // Generate a key if missing (for blog posts without keys)
    if (!key || key === "") {
        key = getUniqueKey();
        // Set the key on the post object if possible
        if (typeof post === 'object' && post !== null) {
            (post as any).key = key;
        }
    }

    // Check if exists
    if (await dbConfig.exists(post)) {
        return false;
    }

    try {
        // Determine which table we're inserting into and build appropriate query
        if (tableName === 'blog_posts') {
            const article = post as any;
            const stmt = db.prepare(`
                INSERT INTO blog_posts (
                    key, title, content, author, timestamp, category, 
                    headImage, shortDescription, originalNewsItem, writerType
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            // Provide default timestamp if missing
            const timestamp = article.timestamp || new Date().toISOString();
            // Default writerType to 'AI' if not provided
            const writerType = article.writerType || 'AI';
            
            stmt.run(
                key,
                article.title || null,
                article.content || null,
                serializeJson(article.author) || null,
                timestamp,
                article.category || null,
                article.headImage || null,
                article.shortDescription || null,
                serializeJson(article.originalNewsItem) || null,
                writerType
            );
        } else if (tableName === 'news_items') {
            const newsItem = post as any;
            const stmt = db.prepare(`
                INSERT INTO news_items (
                    article_id, title, description, pubDate, pubDateTZ
                ) VALUES (?, ?, ?, ?, ?)
            `);
            stmt.run(
                key,
                newsItem.title || null,
                newsItem.description || null,
                newsItem.pubDate || null,
                newsItem.pubDateTZ || null
            );
        } else if (tableName === 'writers') {
            const writer = post as any;
            const stmt = db.prepare(`
                INSERT INTO writers (
                    key, name, description, systemPrompt, profileImage, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(
                key,
                writer.name || null,
                writer.description || null,
                writer.systemPrompt || null,
                writer.profileImage || null,
                writer.createdAt || null,
                writer.updatedAt || null
            );
        } else if (tableName === 'featured_blog_posts') {
            const featured = post as any;
            const stmt = db.prepare(`
                INSERT INTO featured_blog_posts (
                    key, title, content, author, timestamp, category,
                    headImage, shortDescription, originalNewsItem
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(
                key,
                featured.title || null,
                serializeJson(featured.content),
                serializeJson(featured.author),
                featured.timestamp || null,
                featured.category || null,
                featured.headImage || null,
                featured.shortDescription || null,
                serializeJson(featured.originalNewsItem)
            );
        } else {
            throw new Error(`Unknown table: ${tableName}`);
        }

        return true;
    } catch (error) {
        if (error instanceof Database.SqliteError) {
            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                // Duplicate key - already exists
                return false;
            }
            console.error('SQLite error creating post:', error.message);
        } else {
            console.error('Error creating post:', error);
        }
        return false;
    }
}

/**
 * Gets all posts from the database
 */
export async function getAllPosts<P>(dbConfig: DatabaseConfig<P>): Promise<P[]> {
    const db = getDatabase();
    const tableName = getTableName(dbConfig.source);

    try {
        const stmt = db.prepare(`SELECT * FROM ${tableName}`);
        const rows = stmt.all() as any[];

        return rows.map(row => {
            const post: any = {};

            if (tableName === 'blog_posts') {
                post.key = row.key;
                post.title = row.title;
                post.content = row.content;
                post.author = deserializeJson(row.author);
                post.timestamp = row.timestamp;
                post.category = row.category;
                post.headImage = row.headImage;
                post.shortDescription = row.shortDescription;
                post.originalNewsItem = deserializeJson(row.originalNewsItem);
                post.writerType = row.writerType || 'AI';
            } else if (tableName === 'news_items') {
                post.article_id = row.article_id;
                post.title = row.title;
                post.description = row.description;
                post.pubDate = row.pubDate;
                post.pubDateTZ = row.pubDateTZ;
            } else if (tableName === 'writers') {
                post.key = row.key;
                post.name = row.name;
                post.description = row.description;
                post.systemPrompt = row.systemPrompt;
                post.profileImage = row.profileImage;
                post.createdAt = row.createdAt;
                post.updatedAt = row.updatedAt;
            } else if (tableName === 'featured_blog_posts') {
                post.key = row.key;
                post.title = row.title;
                post.content = deserializeJson(row.content);
                post.author = deserializeJson(row.author);
                post.timestamp = row.timestamp;
                post.category = row.category;
                post.headImage = row.headImage;
                post.shortDescription = row.shortDescription;
                post.originalNewsItem = deserializeJson(row.originalNewsItem);
            }

            return post as P;
        });
    } catch (error) {
        console.error('Error getting all posts:', error);
        return [];
    }
}

/**
 * Gets the total count of posts in the database
 */
export async function getPostsCount<P>(dbConfig: DatabaseConfig<P>): Promise<number> {
    const db = getDatabase();
    const tableName = getTableName(dbConfig.source);

    try {
        const stmt = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`);
        const result = stmt.get() as any;
        return result?.count || 0;
    } catch (error) {
        console.error('Error getting posts count:', error);
        return 0;
    }
}

/**
 * Gets paginated posts from the database
 * @param dbConfig Database configuration
 * @param page Page number (1-indexed)
 * @param itemsPerPage Number of items per page
 * @param orderBy Column to order by (default: 'timestamp')
 * @param orderDirection 'ASC' or 'DESC' (default: 'DESC')
 */
export async function getPostsPaginated<P>(
    dbConfig: DatabaseConfig<P>,
    page: number = 1,
    itemsPerPage: number = 10,
    orderBy: string = 'timestamp',
    orderDirection: 'ASC' | 'DESC' = 'DESC'
): Promise<P[]> {
    const db = getDatabase();
    const tableName = getTableName(dbConfig.source);

    try {
        // Validate and sanitize orderBy to prevent SQL injection
        const validColumns = ['timestamp', 'key', 'title', 'category'];
        const safeOrderBy = validColumns.includes(orderBy) ? orderBy : 'timestamp';
        const safeOrderDirection = orderDirection === 'ASC' ? 'ASC' : 'DESC';
        
        const offset = (page - 1) * itemsPerPage;
        const limit = itemsPerPage;
        
        const stmt = db.prepare(
            `SELECT * FROM ${tableName} ORDER BY ${safeOrderBy} ${safeOrderDirection} LIMIT ? OFFSET ?`
        );
        const rows = stmt.all(limit, offset) as any[];

        return rows.map(row => {
            const post: any = {};

            if (tableName === 'blog_posts') {
                post.key = row.key;
                post.title = row.title;
                post.content = row.content;
                post.author = deserializeJson(row.author);
                post.timestamp = row.timestamp;
                post.category = row.category;
                post.headImage = row.headImage;
                post.shortDescription = row.shortDescription;
                post.originalNewsItem = deserializeJson(row.originalNewsItem);
                post.writerType = row.writerType || 'AI';
            } else if (tableName === 'news_items') {
                post.article_id = row.article_id;
                post.title = row.title;
                post.description = row.description;
                post.pubDate = row.pubDate;
                post.pubDateTZ = row.pubDateTZ;
            } else if (tableName === 'writers') {
                post.key = row.key;
                post.name = row.name;
                post.description = row.description;
                post.systemPrompt = row.systemPrompt;
                post.profileImage = row.profileImage;
                post.createdAt = row.createdAt;
                post.updatedAt = row.updatedAt;
            } else if (tableName === 'featured_blog_posts') {
                post.key = row.key;
                post.title = row.title;
                post.content = deserializeJson(row.content);
                post.author = deserializeJson(row.author);
                post.timestamp = row.timestamp;
                post.category = row.category;
                post.headImage = row.headImage;
                post.shortDescription = row.shortDescription;
                post.originalNewsItem = deserializeJson(row.originalNewsItem);
            }

            return post as P;
        });
    } catch (error) {
        console.error('Error getting paginated posts:', error);
        return [];
    }
}

/**
 * Gets a post by its key
 */
export async function getPostByKey<P>(key: string, dbConfig: DatabaseConfig<P>): Promise<P | undefined> {
    const db = getDatabase();
    const tableName = getTableName(dbConfig.source);

    try {
        // Determine primary key column name
        const keyColumn = tableName === 'news_items' ? 'article_id' : 'key';
        const stmt = db.prepare(`SELECT * FROM ${tableName} WHERE ${keyColumn} = ?`);
        const row = stmt.get(key) as any;

        if (!row) {
            return undefined;
        }

        const post: any = {};

        if (tableName === 'blog_posts') {
            post.key = row.key;
            post.title = row.title;
            post.content = row.content;
            post.author = deserializeJson(row.author);
            post.timestamp = row.timestamp;
            post.category = row.category;
            post.headImage = row.headImage;
            post.shortDescription = row.shortDescription;
            post.originalNewsItem = deserializeJson(row.originalNewsItem);
            post.writerType = row.writerType || 'AI';
        } else if (tableName === 'news_items') {
            post.article_id = row.article_id;
            post.title = row.title;
            post.description = row.description;
            post.pubDate = row.pubDate;
            post.pubDateTZ = row.pubDateTZ;
        } else if (tableName === 'writers') {
            post.key = row.key;
            post.name = row.name;
            post.description = row.description;
            post.systemPrompt = row.systemPrompt;
            post.profileImage = row.profileImage;
            post.createdAt = row.createdAt;
            post.updatedAt = row.updatedAt;
        } else if (tableName === 'featured_blog_posts') {
            post.key = row.key;
            post.title = row.title;
            post.content = deserializeJson(row.content);
            post.author = deserializeJson(row.author);
            post.timestamp = row.timestamp;
            post.category = row.category;
            post.headImage = row.headImage;
            post.shortDescription = row.shortDescription;
            post.originalNewsItem = deserializeJson(row.originalNewsItem);
        }

        return post as P;
    } catch (error) {
        console.error('Error getting post by key:', error);
        return undefined;
    }
}

/**
 * Updates a post in the database
 */
export async function updatePost<P>(newPost: P, dbConfig: DatabaseConfig<P>): Promise<boolean> {
    const db = getDatabase();
    const tableName = getTableName(dbConfig.source);
    const key = await dbConfig.getKey(newPost);

    // Check if post exists
    const existingPost = await dbConfig.find(key);
    if (!existingPost) {
        return false;
    }

    try {
        // Copy values to existing post object
        dbConfig.copyValues(newPost, existingPost);

        // Update in database
        if (tableName === 'blog_posts') {
            const article = existingPost as any;
            const stmt = db.prepare(`
                UPDATE blog_posts SET
                    title = ?, content = ?, author = ?, timestamp = ?, category = ?,
                    headImage = ?, shortDescription = ?, originalNewsItem = ?, writerType = ?
                WHERE key = ?
            `);
            // Default writerType to 'AI' if not provided
            const writerType = article.writerType || 'AI';
            stmt.run(
                article.title || null,
                article.content || null,
                serializeJson(article.author),
                article.timestamp || null,
                article.category || null,
                article.headImage || null,
                article.shortDescription || null,
                serializeJson(article.originalNewsItem),
                writerType,
                key
            );
        } else if (tableName === 'news_items') {
            const newsItem = existingPost as any;
            const stmt = db.prepare(`
                UPDATE news_items SET
                    title = ?, description = ?, pubDate = ?, pubDateTZ = ?
                WHERE article_id = ?
            `);
            stmt.run(
                newsItem.title || null,
                newsItem.description || null,
                newsItem.pubDate || null,
                newsItem.pubDateTZ || null,
                key
            );
        } else if (tableName === 'writers') {
            const writer = existingPost as any;
            const stmt = db.prepare(`
                UPDATE writers SET
                    name = ?, description = ?, systemPrompt = ?, profileImage = ?,
                    createdAt = ?, updatedAt = ?
                WHERE key = ?
            `);
            stmt.run(
                writer.name || null,
                writer.description || null,
                writer.systemPrompt || null,
                writer.profileImage || null,
                writer.createdAt || null,
                writer.updatedAt || null,
                key
            );
        } else if (tableName === 'featured_blog_posts') {
            const featured = existingPost as any;
            const stmt = db.prepare(`
                UPDATE featured_blog_posts SET
                    title = ?, content = ?, author = ?, timestamp = ?, category = ?,
                    headImage = ?, shortDescription = ?, originalNewsItem = ?
                WHERE key = ?
            `);
            stmt.run(
                featured.title || null,
                serializeJson(featured.content),
                serializeJson(featured.author),
                featured.timestamp || null,
                featured.category || null,
                featured.headImage || null,
                featured.shortDescription || null,
                serializeJson(featured.originalNewsItem),
                key
            );
        }

        return true;
    } catch (error) {
        console.error('Error updating post:', error);
        return false;
    }
}

/**
 * Deletes a post from the database
 */
export async function deletePost<P>(key: string, dbConfig: DatabaseConfig<P>): Promise<boolean> {
    const db = getDatabase();
    const tableName = getTableName(dbConfig.source);

    try {
        // Determine primary key column name
        const keyColumn = tableName === 'news_items' ? 'article_id' : 'key';
        const stmt = db.prepare(`DELETE FROM ${tableName} WHERE ${keyColumn} = ?`);
        const result = stmt.run(key);

        // Check if any row was deleted
        return result.changes > 0;
    } catch (error) {
        console.error('Error deleting post:', error);
        return false;
    }
}

