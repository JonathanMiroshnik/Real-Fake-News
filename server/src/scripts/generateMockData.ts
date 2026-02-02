import { initializeSchema } from '../lib/database/schema.js';
import { getDatabase, closeDatabase } from '../lib/database/database.js';
import { createPost } from '../lib/database/sqliteOperations.js';
import { 
    blogDatabaseConfig, 
    newsDatabaseConfig, 
    writerDatabaseConfig, 
    featuredBlogDatabaseConfig,
    recipeDatabaseConfig 
} from '../lib/database/databaseConfigurations.js';
import { ArticleScheme, FeaturedArticleScheme, RecipeScheme } from '../types/article.js';
import { NewsItem } from '../services/newsService.js';
import { Writer } from '../types/writer.js';
import { Horoscope } from '../types/horoscope.js';
import { getUniqueKey } from '../utils/general.js';

// Mock data generators
const CATEGORIES = ['Technology', 'Travel', 'Food', 'Science', 'Health', 'Business', 'Entertainment', 'Sports'];
const WRITER_NAMES = ['Alex Johnson', 'Sam Smith', 'Taylor Reed', 'Jordan Lee', 'Casey Kim', 'Morgan Wells'];
const WRITER_DESCRIPTIONS = [
    'Award-winning journalist with 10+ years of experience',
    'Tech enthusiast and startup advisor',
    'Travel blogger exploring hidden gems worldwide',
    'Food critic and culinary expert',
    'Science communicator making complex topics accessible',
    'Business analyst and market trends expert'
];
const FOOD_NAMES = ['Pizza', 'Pasta', 'Sushi', 'Burger', 'Salad', 'Soup', 'Steak', 'Tacos', 'Curry', 'Sandwich'];
const ZODIAC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start: Date, end: Date): string {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString();
}

function generateLoremIpsum(words: number = 50): string {
    const lorem = 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum';
    const wordArray = lorem.split(' ');
    const result = [];
    for (let i = 0; i < words; i++) {
        result.push(wordArray[i % wordArray.length]);
    }
    return result.join(' ');
}

function generateParagraphs(count: number = 3): string[] {
    const paragraphs = [];
    for (let i = 0; i < count; i++) {
        paragraphs.push(generateLoremIpsum(30 + Math.floor(Math.random() * 40)));
    }
    return paragraphs;
}

function generateWriter(): Writer {
    const now = new Date().toISOString();
    const name = getRandomElement(WRITER_NAMES);
    const description = getRandomElement(WRITER_DESCRIPTIONS);
    
    return {
        key: getUniqueKey(),
        name,
        description,
        systemPrompt: `You are ${name}, ${description.toLowerCase()}. Write in a professional yet engaging tone.`,
        profileImage: `https://example.com/images/${name.toLowerCase().replace(' ', '-')}.jpg`,
        createdAt: now,
        updatedAt: now
    };
}

function generateArticle(writer?: Writer): ArticleScheme {
    const categories = [...CATEGORIES];
    const category = getRandomElement(categories);
    const title = `${category} News: ${generateLoremIpsum(5).replace(/\.$/, '')}`;
    const now = new Date();
    const pastDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    
    return {
        key: getUniqueKey(),
        title,
        content: generateLoremIpsum(100 + Math.floor(Math.random() * 200)),
        author: writer || generateWriter(),
        timestamp: getRandomDate(pastDate, now),
        category,
        headImage: `https://example.com/images/${category.toLowerCase()}-${Math.floor(Math.random() * 10)}.jpg`,
        shortDescription: generateLoremIpsum(15),
        writerType: getRandomElement(['AI', 'Human', 'Synthesis']),
        isFeatured: Math.random() > 0.7,
        featuredDate: Math.random() > 0.7 ? getRandomDate(pastDate, now) : undefined
    };
}

function generateNewsItem(): NewsItem {
    const now = new Date();
    const pastDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const title = `Breaking: ${generateLoremIpsum(6).replace(/\.$/, '')}`;
    
    return {
        article_id: `news-${getUniqueKey()}`,
        title,
        description: generateLoremIpsum(40),
        pubDate: getRandomDate(pastDate, now),
        pubDateTZ: 'UTC'
    };
}

function generateFeaturedArticle(writers: Writer[], articles: ArticleScheme[]): FeaturedArticleScheme {
    const category = getRandomElement(CATEGORIES);
    const title = `Featured: ${category} Special Report`;
    const now = new Date();
    const pastDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    
    // Select 2-4 random articles for content
    const selectedArticles = [];
    const articleCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < articleCount && i < articles.length; i++) {
        const randomIndex = Math.floor(Math.random() * articles.length);
        selectedArticles.push({...articles[randomIndex]});
    }
    
    // Select 1-3 random writers for authors
    const selectedWriters = [];
    const writerCount = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < writerCount && i < writers.length; i++) {
        const randomIndex = Math.floor(Math.random() * writers.length);
        selectedWriters.push({...writers[randomIndex]});
    }
    
    return {
        key: getUniqueKey(),
        title,
        content: selectedArticles,
        author: selectedWriters,
        timestamp: getRandomDate(pastDate, now),
        category,
        headImage: `https://example.com/images/featured-${category.toLowerCase()}.jpg`,
        shortDescription: `A comprehensive look at the latest developments in ${category}`,
        originalNewsItem: generateNewsItem()
    };
}

function generateRecipe(writer?: Writer): RecipeScheme {
    const foodName = getRandomElement(FOOD_NAMES);
    const title = `Delicious ${foodName} Recipe`;
    const now = new Date();
    const pastDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    
    return {
        key: getUniqueKey(),
        title,
        paragraphs: generateParagraphs(4),
        author: writer || generateWriter(),
        timestamp: getRandomDate(pastDate, now),
        category: 'Food',
        headImage: `https://example.com/images/${foodName.toLowerCase()}-recipe.jpg`,
        images: [
            `https://example.com/images/${foodName.toLowerCase()}-1.jpg`,
            `https://example.com/images/${foodName.toLowerCase()}-2.jpg`
        ],
        shortDescription: `Learn how to make the perfect ${foodName} with this easy-to-follow recipe`,
        writerType: getRandomElement(['AI', 'Human', 'Synthesis'])
    };
}

function generateHoroscope(): Horoscope {
    const now = new Date();
    const zodiacSign = getRandomElement(ZODIAC_SIGNS);
    const date = getRandomDate(new Date(now.getFullYear(), now.getMonth(), 1), now);
    
    return {
        date,
        zodiacSign,
        content: generateLoremIpsum(30),
        astrologicalData: {
            date,
            planets: [
                { name: 'Sun', longitude: Math.random() * 360, latitude: Math.random() * 180, sign: zodiacSign, isRetrograde: Math.random() > 0.8 },
                { name: 'Moon', longitude: Math.random() * 360, latitude: Math.random() * 180, sign: getRandomElement(ZODIAC_SIGNS), isRetrograde: Math.random() > 0.9 }
            ],
            retrogrades: Math.random() > 0.7 ? ['Mercury', 'Venus'].slice(0, Math.floor(Math.random() * 2) + 1) : [],
            notableAspects: ['Sun trine Moon', 'Mars square Jupiter'].slice(0, Math.floor(Math.random() * 2) + 1)
        }
    };
}

async function insertFoods() {
    const db = getDatabase();
    console.log('🍕 Inserting food names...');
    
    for (const foodName of FOOD_NAMES) {
        try {
            const stmt = db.prepare('INSERT OR IGNORE INTO foods (name) VALUES (?)');
            stmt.run(foodName);
        } catch (error) {
            console.error(`Error inserting food ${foodName}:`, error);
        }
    }
    console.log(`✅ Inserted ${FOOD_NAMES.length} food names`);
}

async function insertHoroscopes(count: number = 24) {
    const db = getDatabase();
    console.log('🔮 Inserting horoscopes...');
    
    // Check if horoscopes table exists, create if not
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS horoscopes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                zodiacSign TEXT NOT NULL,
                content TEXT NOT NULL,
                astrologicalData TEXT NOT NULL,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(date, zodiacSign)
            )
        `);
    } catch (error) {
        console.error('Error creating horoscopes table:', error);
    }
    
    let inserted = 0;
    for (let i = 0; i < count; i++) {
        try {
            const horoscope = generateHoroscope();
            const stmt = db.prepare(`
                INSERT OR IGNORE INTO horoscopes (date, zodiacSign, content, astrologicalData)
                VALUES (?, ?, ?, ?)
            `);
            const result = stmt.run(
                horoscope.date,
                horoscope.zodiacSign,
                horoscope.content,
                JSON.stringify(horoscope.astrologicalData)
            );
            if (result.changes > 0) {
                inserted++;
            }
        } catch (error) {
            console.error('Error inserting horoscope:', error);
        }
    }
    console.log(`✅ Inserted ${inserted} horoscopes`);
}

async function generateMockData(options: {
    writers?: number;
    articles?: number;
    newsItems?: number;
    featuredArticles?: number;
    recipes?: number;
    foods?: boolean;
    horoscopes?: number;
}) {
    console.log('🚀 Starting mock data generation...\n');
    
    // Initialize schema and database connection
    initializeSchema();
    getDatabase();
    
    const defaultOptions = {
        writers: 5,
        articles: 20,
        newsItems: 15,
        featuredArticles: 5,
        recipes: 10,
        foods: true,
        horoscopes: 24
    };
    
    const config = { ...defaultOptions, ...options };
    
    try {
        // Generate writers first (they're referenced by other entities)
        console.log('✍️  Generating writers...');
        const writers: Writer[] = [];
        for (let i = 0; i < config.writers; i++) {
            const writer = generateWriter();
            const result = await createPost(writer, writerDatabaseConfig);
            if (result) {
                writers.push(writer);
                process.stdout.write('.');
            }
        }
        console.log(`\n✅ Generated ${writers.length} writers`);
        
        // Generate articles
        console.log('\n📝 Generating articles...');
        const articles: ArticleScheme[] = [];
        for (let i = 0; i < config.articles; i++) {
            const writer = getRandomElement(writers);
            const article = generateArticle(writer);
            const result = await createPost(article, blogDatabaseConfig);
            if (result) {
                articles.push(article);
                process.stdout.write('.');
            }
        }
        console.log(`\n✅ Generated ${articles.length} articles`);
        
        // Generate news items
        console.log('\n📰 Generating news items...');
        let newsCount = 0;
        for (let i = 0; i < config.newsItems; i++) {
            const newsItem = generateNewsItem();
            const result = await createPost(newsItem, newsDatabaseConfig);
            if (result) {
                newsCount++;
                process.stdout.write('.');
            }
        }
        console.log(`\n✅ Generated ${newsCount} news items`);
        
        // Generate featured articles
        console.log('\n⭐ Generating featured articles...');
        let featuredCount = 0;
        for (let i = 0; i < config.featuredArticles; i++) {
            const featuredArticle = generateFeaturedArticle(writers, articles);
            const result = await createPost(featuredArticle, featuredBlogDatabaseConfig);
            if (result) {
                featuredCount++;
                process.stdout.write('.');
            }
        }
        console.log(`\n✅ Generated ${featuredCount} featured articles`);
        
        // Generate recipes
        console.log('\n🍳 Generating recipes...');
        let recipeCount = 0;
        for (let i = 0; i < config.recipes; i++) {
            const writer = getRandomElement(writers);
            const recipe = generateRecipe(writer);
            const result = await createPost(recipe, recipeDatabaseConfig);
            if (result) {
                recipeCount++;
                process.stdout.write('.');
            }
        }
        console.log(`\n✅ Generated ${recipeCount} recipes`);
        
        // Insert foods
        if (config.foods) {
            await insertFoods();
        }
        
        // Insert horoscopes
        if (config.horoscopes && config.horoscopes > 0) {
            await insertHoroscopes(config.horoscopes);
        }
        
        // Display summary
        console.log('\n📊 Mock Data Generation Summary:');
        console.log('===============================');
        console.log(`   Writers: ${writers.length}`);
        console.log(`   Articles: ${articles.length}`);
        console.log(`   News Items: ${newsCount}`);
        console.log(`   Featured Articles: ${featuredCount}`);
        console.log(`   Recipes: ${recipeCount}`);
        console.log(`   Food Names: ${config.foods ? FOOD_NAMES.length : 0}`);
        console.log(`   Horoscopes: ${config.horoscopes || 0}`);
        
        // Count total records
        const db = getDatabase();
        const blogCount = db.prepare('SELECT COUNT(*) as count FROM blog_posts').get() as { count: number };
        const newsCountResult = db.prepare('SELECT COUNT(*) as count FROM news_items').get() as { count: number };
        const writerCount = db.prepare('SELECT COUNT(*) as count FROM writers').get() as { count: number };
        const featuredCountResult = db.prepare('SELECT COUNT(*) as count FROM featured_blog_posts').get() as { count: number };
        const recipeCountResult = db.prepare('SELECT COUNT(*) as count FROM recipes').get() as { count: number };
        const foodCount = db.prepare('SELECT COUNT(*) as count FROM foods').get() as { count: number };
        const horoscopeCount = db.prepare('SELECT COUNT(*) as count FROM horoscopes').get() as { count: number };
        
        console.log('\n📈 Database Record Counts:');
        console.log('==========================');
        console.log(`   Blog posts: ${blogCount.count}`);
        console.log(`   News items: ${newsCountResult.count}`);
        console.log(`   Writers: ${writerCount.count}`);
        console.log(`   Featured posts: ${featuredCountResult.count}`);
        console.log(`   Recipes: ${recipeCountResult.count}`);
        console.log(`   Foods: ${foodCount.count}`);
        console.log(`   Horoscopes: ${horoscopeCount.count}`);
        
        console.log('\n🎉 Mock data generation completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Error generating mock data:', error);
        throw error;
    } finally {
        closeDatabase();
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    
    // Parse command line arguments
    const options: any = {};
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            const key = arg.slice(2);
            const nextArg = args[i + 1];
            if (nextArg && !nextArg.startsWith('--')) {
                const value = parseInt(nextArg, 10);
                if (!isNaN(value)) {
                    options[key] = value;
                    i++; // Skip next argument since we used it
                } else if (nextArg === 'true' || nextArg === 'false') {
                    options[key] = nextArg === 'true';
                    i++;
                }
            } else {
                // Boolean flag (e.g., --no-foods)
                options[key] = true;
            }
        }
    }
    
    // Show help if requested
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Mock Data Generator for Real-Fake-News Backend
=============================================

Usage:
  npm run generate-mock-data [options]

Options:
  --writers <number>      Number of writers to generate (default: 5)
  --articles <number>     Number of articles to generate (default: 20)
  --news-items <number>   Number of news items to generate (default: 15)
  --featured <number>     Number of featured articles to generate (default: 5)
  --recipes <number>      Number of recipes to generate (default: 10)
  --horoscopes <number>   Number of horoscopes to generate (default: 24)
  --no-foods             Skip inserting food names (default: insert foods)
  --help, -h             Show this help message

Examples:
  npm run generate-mock-data
  npm run generate-mock-data --writers 3 --articles 10
  npm run generate-mock-data --no-foods --horoscopes 12
  npm run generate-mock-data --help
`);
        return;
    }
    
    // Convert options to expected format
    const generateOptions = {
        writers: options.writers,
        articles: options.articles,
        newsItems: options['news-items'],
        featuredArticles: options.featured,
        recipes: options.recipes,
        foods: options.foods === undefined ? true : options.foods,
        horoscopes: options.horoscopes
    };
    
    // Handle --no-foods flag
    if (options['no-foods']) {
        generateOptions.foods = false;
    }
    
    try {
        await generateMockData(generateOptions);
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Failed to generate mock data:', error);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Unhandled error:', error);
        process.exit(1);
    });
}

export { generateMockData };