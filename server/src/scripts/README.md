# Scripts Directory

This directory contains utility scripts that should run once or periodically for maintenance tasks.

## Available Scripts

### 1. `generateMockData.ts` - Mock Data Generator

**Purpose:** Populates the database with realistic sample data for development and testing.

**Usage:**
```bash
npm run generate-mock-data [options]
```

**Options:**
- `--writers <number>`: Number of writers to generate (default: 5)
- `--articles <number>`: Number of articles to generate (default: 20)
- `--news-items <number>`: Number of news items to generate (default: 15)
- `--featured <number>`: Number of featured articles to generate (default: 5)
- `--recipes <number>`: Number of recipes to generate (default: 10)
- `--horoscopes <number>`: Number of horoscopes to generate (default: 24)
- `--no-foods`: Skip inserting food names (default: insert foods)
- `--help, -h`: Show help message

**Examples:**
```bash
# Generate default amount of data (5 writers, 20 articles, 15 news items, etc.)
npm run generate-mock-data

# Generate minimal data for quick testing
npm run generate-mock-data --writers 2 --articles 5

# Generate data without food entries
npm run generate-mock-data --no-foods

# Show help message
npm run generate-mock-data --help
```

**Using Docker Compose:**
```bash
docker compose exec server npm run generate-mock-data
docker compose exec server npm run generate-mock-data --writers 3 --articles 10 --recipes 5
```

**What it generates:**
- **Writers**: AI-generated writer profiles with names, descriptions, and system prompts
- **Articles**: News articles in various categories (Technology, Travel, Food, Science, etc.)
- **News Items**: Breaking news items fetched from external APIs (simulated)
- **Featured Articles**: Special reports with multiple authors and sub-articles
- **Recipes**: Food recipes with ingredients and instructions
- **Horoscopes**: Daily horoscopes for all zodiac signs with astrological data
- **Foods**: Basic food names for recipe generation

**Features:**
- Realistic Lorem Ipsum content with proper formatting
- Dates distributed over the past year
- Proper relationships between entities (writers author articles, etc.)
- Random category assignment
- Featured articles with isFeatured flag and featuredDate
- Writer types (AI, Human, Synthesis)
- Image URLs for head images (example.com placeholder)
- Progress indicators with emojis for visual feedback

### 2. `migrateToSqlite.ts` - Database Migration Script

**Purpose:** Migrates data from JSON files to SQLite database.

**Usage:**
```bash
npm run migrate
```

**What it does:**
- Migrates blog posts from `data/blogPosts.json`
- Migrates news items from `data/newsData.json`
- Migrates writers from `data/writers.json`
- Migrates featured blog posts from `data/featuredBlogPosts.json`
- Creates SQLite schema if not exists
- Handles duplicates gracefully
- Provides migration summary with counts

### 3. `compressExistingImages.ts` - Image Compression Script

**Purpose:** Compresses existing images in the media directory.

**Usage:**
```bash
npm run compress-images
```

**What it does:**
- Scans media directory for images
- Compresses JPEG/PNG images while maintaining quality
- Creates backup of original files
- Provides compression statistics

## Database Schema

The scripts work with the following SQLite tables:

### `blog_posts`
- Stores regular blog articles
- Columns: key, title, content, author, timestamp, category, headImage, shortDescription, originalNewsItem, writerType, isFeatured, featuredDate

### `news_items`
- Stores news articles from external APIs
- Columns: article_id, title, description, pubDate, pubDateTZ

### `writers`
- Stores writer profiles
- Columns: key, name, description, systemPrompt, profileImage, createdAt, updatedAt

### `featured_blog_posts`
- Stores featured articles with multiple authors and sub-articles
- Columns: key, title, content, author, timestamp, category, headImage, shortDescription, originalNewsItem

### `recipes`
- Stores recipe articles
- Columns: key, title, paragraphs, author, timestamp, category, headImage, images, shortDescription, writerType

### `foods`
- Stores food names for recipe generation
- Columns: name

### `horoscopes`
- Stores daily horoscope data
- Columns: id, date, zodiacSign, content, astrologicalData, createdAt

## Running Scripts Locally

Without Docker:
```bash
cd server
npm run generate-mock-data [options]
npm run migrate
npm run compress-images
```

With Docker:
```bash
docker compose exec server npm run generate-mock-data [options]
docker compose exec server npm run migrate
docker compose exec server npm run compress-images
```

## Database Location

By default, scripts use the SQLite database at `server/data/database.db`. Make sure this file exists and is writable.

## Development Notes

- All scripts use TypeScript and run with `tsx`
- Scripts are modular and can be imported individually
- Error handling includes try-catch blocks and proper logging
- Progress indicators show real-time feedback
- SQLite operations use `better-sqlite3` with prepared statements
- Mock data generation includes realistic relationships between entities