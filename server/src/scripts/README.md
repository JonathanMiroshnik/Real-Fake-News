# Scripts Directory

This directory contains utility scripts that should run once or periodically for maintenance tasks.

## Available Scripts

### 1. `seedDevData.ts` - Dev Content Seeder

**Purpose:** Fills an empty development database with reviewable mock content
(writers, articles, news items, recipes, foods, today's horoscopes) and real
placeholder images. Replaces the old `generateMockData.ts`, which produced
different nonsense on every run, used `example.com` image URLs and could not be
repeated or cleaned up.

**Usage:**

```bash
npm run seed:dev                # insert anything missing (idempotent)
npm run seed:reset              # delete seeded rows + images, then re-insert
npm run seed:dev -- --force     # overwrite existing seeded rows
npm run seed:dev -- --seed 42   # different PRNG seed for the placeholder images
npm run seed:dev -- --help      # usage
```

**What it writes:**

- **Writers** (5) — name, description, system prompt, profile image
- **Articles** (20) — spread over the last week, each with a head image
- **News items** (15) — the input rows the article job reads
- **Recipes** (10) — with author, paragraphs and a head image
- **Foods** (5) — the names the recipe job samples from
- **Horoscopes** (12) — today's set, one row per zodiac sign, with astrological data

Images are real PNGs written through the normal compression path
(`IMAGES_PATH/original` + `IMAGES_PATH/compressed`), never remote URLs.

**Rules that make it predictable:**

- **Deterministic** — one `mulberry32(FIXED_SEED)` PRNG, so the same `--seed`
  produces byte-identical images. Timestamps are "now minus N hours", so the feed
  always looks recent.
- **Idempotent** — every row is keyed `dev-…`; a second run inserts nothing and
  reports `skipped`. `--force` rewrites rows in place (delete + insert, because
  the write path has no update).
- **Reversible** — `--reset` deletes only what the seeder created: rows whose key
  starts with `dev-`, the mock food names, today's horoscope set, and the matching
  image files.
- **Safe** — refuses to run when `NODE_ENV=production` unless `--force` is passed.
- **Writes through `sqliteOperations` / `config/paths.ts`**, i.e. the same code
  path as the jobs, so the database lands wherever the API looks for it.

The content itself lives in `src/services/contentSources/mocks/` as typed
TypeScript arrays — one source of truth, shared with the mock content sources,
and a schema change becomes a compile error instead of a silent mismatch.

**Using Docker Compose:**

```bash
# the dev overlay already runs the seeder once on `up`
npm run docker:dev

# wipe and rewrite the seeded content
docker compose -f docker-compose.yml -f docker-compose.dev.yml \
  run --rm seed node --no-warnings dist/scripts/seedDevData.js --reset
```

### 2. `generateFakeImage.ts` - Placeholder Image Generator

**Purpose:** Writes a single tiled placeholder image, for inspecting what the
seeder's images look like.

**Usage:**

```bash
npm run generate-fake-image -- --width 896 --height 512 --tiles-x 8 --tiles-y 6
```

The drawing itself lives in `src/utils/placeholderImage.ts`
(`createTilePlaceholderImage`), so the seeder and this CLI share one
implementation.

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
npm run seed:dev [-- --reset|--force|--seed <n>]
npm run seed:reset
npm run compress-images
```

With Docker:

```bash
docker compose exec server npm run seed:dev [-- --reset|--force|--seed <n>]
docker compose exec server npm run compress-images
```

## Database Location

Scripts use whatever `DATABASE_PATH` points at (`server/src/config/paths.ts`):
`/data/database.db` inside the container, or an absolute host path when the API
runs on the host. There is no fallback — `DATABASE_PATH` and `IMAGES_PATH` are
required, and a missing value throws `MissingPathConfigError` instead of creating
a `database/` folder in the repo. `server/.env` is loaded relative to the source
file, so a `tsx` script works from any working directory.

## Development Notes

- All scripts use TypeScript and run with `tsx`
- Scripts are modular and can be imported individually
- Error handling includes try-catch blocks and proper logging
- Progress indicators show real-time feedback
- SQLite operations use `better-sqlite3` with prepared statements
- Mock data generation includes realistic relationships between entities
