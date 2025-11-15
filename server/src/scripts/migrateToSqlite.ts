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
            const rawBlogPosts: any[] = blogPostsData.posts || [];
            
            // Filter and validate blog posts
            const blogPosts: ArticleScheme[] = rawBlogPosts
                .filter((post: any) => post.key && post.author) // Must have key and author
                .map((post: any) => ({
                    ...post,
                    author: post.author || null, // Ensure author exists
                    originalNewsItem: post.originalNewsItem || null
                }));
            
            let blogMigrated = 0;
            let blogSkipped = 0;
            for (const post of blogPosts) {
                try {
                    if (!post.key) {
                        blogSkipped++;
                        continue;
                    }
                    const result = await createPost(post, blogDatabaseConfig);
                    if (result) {
                        totalMigrated++;
                        blogMigrated++;
                    } else {
                        blogSkipped++;
                    }
                } catch (error) {
                    console.error(`Error migrating blog post ${post.key}:`, error);
                    totalErrors++;
                }
            }
            console.log(`✅ Processed ${rawBlogPosts.length} blog posts, migrated ${blogMigrated} new posts, skipped ${blogSkipped}`);
        } catch (error) {
            console.error('Error migrating blog posts:', error);
            totalErrors++;
        }

        // Migrate News Items
        console.log('\n📰 Migrating news items...');
        try {
            const newsDataPath = path.join(__dirname, '../../data/newsData.json');
            const newsData = JSON.parse(readFileSync(newsDataPath, 'utf-8'));
            const rawNewsItems: any[] = newsData.posts || [];
            
            // Map to NewsItem type (only required fields)
            const newsItems: NewsItem[] = rawNewsItems.map((item: any) => ({
                article_id: item.article_id || '',
                title: item.title || '',
                description: item.description || '',
                pubDate: item.pubDate || '',
                pubDateTZ: item.pubDateTZ || 'UTC'
            })).filter((item: NewsItem) => item.article_id && item.title); // Filter out invalid items
            
            let newsMigrated = 0;
            for (const item of newsItems) {
                try {
                    const result = await createPost(item, newsDatabaseConfig);
                    if (result) {
                        totalMigrated++;
                        newsMigrated++;
                    } else {
                        console.warn(`News item ${item.article_id} already exists, skipping`);
                    }
                } catch (error) {
                    console.error(`Error migrating news item ${item.article_id}:`, error);
                    totalErrors++;
                }
            }
            console.log(`✅ Processed ${rawNewsItems.length} news items, migrated ${newsMigrated} new items`);
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
            
            let writersMigrated = 0;
            for (const writer of writers) {
                try {
                    const result = await createPost(writer, writerDatabaseConfig);
                    if (result) {
                        totalMigrated++;
                        writersMigrated++;
                    } else {
                        console.warn(`Writer ${writer.key} already exists, skipping`);
                    }
                } catch (error) {
                    console.error(`Error migrating writer ${writer.key}:`, error);
                    totalErrors++;
                }
            }
            console.log(`✅ Processed ${writers.length} writers, migrated ${writersMigrated} new writers`);
        } catch (error) {
            console.error('Error migrating writers:', error);
            totalErrors++;
        }

        // Migrate Featured Blog Posts
        console.log('\n⭐ Migrating featured blog posts...');
        try {
            const featuredPath = path.join(__dirname, '../../data/featuredBlogPosts.json');
            const featuredFileContent = readFileSync(featuredPath, 'utf-8').trim();
            
            // Handle empty file
            if (!featuredFileContent || featuredFileContent === '{}' || featuredFileContent === '') {
                console.log('⚠️  Featured blog posts file is empty, skipping...');
                console.log(`✅ Processed 0 featured posts, migrated 0 new posts`);
            } else {
                const featuredData = JSON.parse(featuredFileContent);
                const featuredPosts: FeaturedArticleScheme[] = featuredData.posts || [];
            
                let featuredMigrated = 0;
                for (const post of featuredPosts) {
                    try {
                        const result = await createPost(post, featuredBlogDatabaseConfig);
                        if (result) {
                            totalMigrated++;
                            featuredMigrated++;
                        } else {
                            console.warn(`Featured post ${post.key} already exists, skipping`);
                        }
                    } catch (error) {
                        console.error(`Error migrating featured post ${post.key}:`, error);
                        totalErrors++;
                    }
                }
                console.log(`✅ Processed ${featuredPosts.length} featured posts, migrated ${featuredMigrated} new posts`);
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

// Run migration if this file is executed directly
// This will work when run via: npm run migrate or tsx src/scripts/migrateToSqlite.ts
migrateJsonToSqlite()
    .then(() => {
        console.log('\n🎉 Migration finished!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    });

export { migrateJsonToSqlite };

