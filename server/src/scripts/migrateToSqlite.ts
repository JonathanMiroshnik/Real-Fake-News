import { readFileSync } from 'fs';
import { initializeSchema } from '../lib/database/schema.js';
import { getDatabase, closeDatabase } from '../lib/database/database.js';
import { blogDatabaseConfig, newsDatabaseConfig, writerDatabaseConfig, featuredBlogDatabaseConfig } from '../lib/lowdb/databaseConfigurations.js';
import { createPost } from '../lib/database/sqliteOperations.js';
import { ArticleScheme } from '../types/article.js';
import { NewsItem } from '../services/newsService.js';
import { Writer } from '../types/writer.js';
import { FeaturedArticleScheme } from '../types/article.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Migration script to import JSON data into SQLite database
 * Run this once to migrate all existing data from JSON files to SQLite
 */
async function migrateJsonToSqlite() {
    console.log('Starting migration from JSON to SQLite...');
    
    // Initialize schema
    initializeSchema();
    getDatabase(); // Establish connection
    
    let totalMigrated = 0;
    let totalErrors = 0;

    try {
        // Migrate Blog Posts
        console.log('\n📝 Migrating blog posts...');
        try {
            const blogPostsPath = path.join(__dirname, '../../data/blogPosts.json');
            const blogPostsData = JSON.parse(readFileSync(blogPostsPath, 'utf-8'));
            const blogPosts: ArticleScheme[] = blogPostsData.posts || [];
            
            for (const post of blogPosts) {
                try {
                    const result = await createPost(post, blogDatabaseConfig);
                    if (result) {
                        totalMigrated++;
                    } else {
                        console.warn(`Blog post ${post.key} already exists, skipping`);
                    }
                } catch (error) {
                    console.error(`Error migrating blog post ${post.key}:`, error);
                    totalErrors++;
                }
            }
            console.log(`✅ Migrated ${blogPosts.length} blog posts`);
        } catch (error) {
            console.error('Error migrating blog posts:', error);
            totalErrors++;
        }

        // Migrate News Items
        console.log('\n📰 Migrating news items...');
        try {
            const newsDataPath = path.join(__dirname, '../../data/newsData.json');
            const newsData = JSON.parse(readFileSync(newsDataPath, 'utf-8'));
            const newsItems: NewsItem[] = newsData.posts || [];
            
            for (const item of newsItems) {
                try {
                    const result = await createPost(item, newsDatabaseConfig);
                    if (result) {
                        totalMigrated++;
                    } else {
                        console.warn(`News item ${item.article_id} already exists, skipping`);
                    }
                } catch (error) {
                    console.error(`Error migrating news item ${item.article_id}:`, error);
                    totalErrors++;
                }
            }
            console.log(`✅ Migrated ${newsItems.length} news items`);
        } catch (error) {
            console.error('Error migrating news items:', error);
            totalErrors++;
        }

        // Migrate Writers
        console.log('\n✍️  Migrating writers...');
        try {
            const writersPath = path.join(__dirname, '../../data/writers.json');
            const writersData = JSON.parse(readFileSync(writersPath, 'utf-8'));
            const writers: Writer[] = writersData.posts || [];
            
            for (const writer of writers) {
                try {
                    const result = await createPost(writer, writerDatabaseConfig);
                    if (result) {
                        totalMigrated++;
                    } else {
                        console.warn(`Writer ${writer.key} already exists, skipping`);
                    }
                } catch (error) {
                    console.error(`Error migrating writer ${writer.key}:`, error);
                    totalErrors++;
                }
            }
            console.log(`✅ Migrated ${writers.length} writers`);
        } catch (error) {
            console.error('Error migrating writers:', error);
            totalErrors++;
        }

        // Migrate Featured Blog Posts
        console.log('\n⭐ Migrating featured blog posts...');
        try {
            const featuredPath = path.join(__dirname, '../../data/featuredBlogPosts.json');
            const featuredFileContent = readFileSync(featuredPath, 'utf-8').trim();
            if (!featuredFileContent) {
                console.log('⚠️  Featured blog posts file is empty, skipping...');
            } else {
                const featuredData = JSON.parse(featuredFileContent);
                const featuredPosts: FeaturedArticleScheme[] = featuredData.posts || [];
            
                for (const post of featuredPosts) {
                    try {
                        const result = await createPost(post, featuredBlogDatabaseConfig);
                        if (result) {
                            totalMigrated++;
                        } else {
                            console.warn(`Featured post ${post.key} already exists, skipping`);
                        }
                    } catch (error) {
                        console.error(`Error migrating featured post ${post.key}:`, error);
                        totalErrors++;
                    }
                }
                console.log(`✅ Migrated ${featuredPosts.length} featured blog posts`);
            }
        } catch (error) {
            console.error('Error migrating featured blog posts:', error);
            totalErrors++;
        }

        // Verify migration
        console.log('\n📊 Migration Summary:');
        console.log(`   Total records migrated: ${totalMigrated}`);
        console.log(`   Total errors: ${totalErrors}`);
        
        // Count records in database
        const db = getDatabase();
        const blogCount = db.prepare('SELECT COUNT(*) as count FROM blog_posts').get() as { count: number };
        const newsCount = db.prepare('SELECT COUNT(*) as count FROM news_items').get() as { count: number };
        const writerCount = db.prepare('SELECT COUNT(*) as count FROM writers').get() as { count: number };
        const featuredCount = db.prepare('SELECT COUNT(*) as count FROM featured_blog_posts').get() as { count: number };
        
        console.log('\n📈 Database Record Counts:');
        console.log(`   Blog posts: ${blogCount.count}`);
        console.log(`   News items: ${newsCount.count}`);
        console.log(`   Writers: ${writerCount.count}`);
        console.log(`   Featured posts: ${featuredCount.count}`);
        
        console.log('\n✅ Migration completed successfully!');
        
    } catch (error) {
        console.error('Fatal error during migration:', error);
        throw error;
    } finally {
        closeDatabase();
    }
}

// Run migration if this file is executed directly (ES module equivalent)
if (import.meta.url === `file://${process.argv[1]}`) {
    migrateJsonToSqlite()
        .then(() => {
            console.log('\n🎉 Migration finished!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Migration failed:', error);
            process.exit(1);
        });
}

export { migrateJsonToSqlite };

