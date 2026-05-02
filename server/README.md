# Server — Express/TypeScript Backend

The backend for Real-Fake-News. Built with Node.js, Express, TypeScript, and SQLite (via better-sqlite3).

## Architecture

```
client (nginx proxy) → server:5001
                     ├── /api/blogs/*      → blogController.ts → blogService.ts → SQLite
                     ├── /api/recipes/*    → recipeController.ts → recipeService.ts → SQLite
                     ├── /api/horoscopes/* → horoscopeController.ts → horoscopeService.ts → SQLite
                     ├── /api/images/*     → apiRoutes.ts → filesystem (image compression)
                     ├── /api/trivia/*     → trivia routes
                     └── /api/health       → health check
```

### Structure

- **`routes/`** — Express Router definitions (blogRoutes, recipeRoutes, horoscopeRoutes, apiRoutes)
- **`controllers/`** — Request/response handlers; interface between HTTP and services
- **`services/`** — Business logic (blogService, recipeService, horoscopeService, newsService, llmService, imageService, fakeDataService)
- **`lib/database/`** — SQLite database layer (schema.ts, database.ts, sqliteOperations.ts, databaseConfigurations.ts)
- **`jobs/`** — Cron/scheduled tasks (news fetching, article generation, horoscope generation)
- **`scripts/`** — CLI utilities (generateMockData, generateFakeImage, migrateToSqlite)
- **`types/`** — TypeScript interfaces (ArticleScheme, RecipeScheme, Writer, Horoscope)
- **`utils/`** — Shared utilities (imageCompression, debugLogger, general)

## Fake Data Fallback

When the database is empty, the API can return auto-generated placeholder content instead of empty responses. See the main [README](../../README.md#fake-data-fallback) for details.

### Key files:
- **`src/services/fakeDataService.ts`** — Generators for fake articles, recipes, horoscopes, and tiled placeholder images
- **`src/scripts/generateFakeImage.ts`** — CLI tool for generating single placeholder images
- **`src/controllers/blogController.ts`** — All blog endpoints check `isFakeDataEnabled()` when empty
- **`src/controllers/recipeController.ts`** — All recipe endpoints check `isFakeDataEnabled()` when empty
- **`src/controllers/horoscopeController.ts`** — Horoscope-by-sign endpoint falls back to fake data

### CLI

```bash
# Generate a placeholder image
npm run generate-fake-image -- --width 896 --height 512 --tiles-x 8 --tiles-y 6

# Generate mock database data
npm run generate-mock-data
```

## Production Deployment

### ⚠️ CRITICAL: Node.js Version Requirement

**This project requires Node.js version 20 or higher.** The production server must be running Node.js 20.x, 22.x, 23.x, or 24.x.

**Check your Node.js version:**
```bash
node --version
```

If you see `v18.x.x` or lower, you **must upgrade** before deploying.

### Upgrading Node.js on Production Server

#### Option 1: Using NVM (Recommended)

If you have NVM installed:

```bash
# Install Node.js 22 (LTS)
nvm install 22
nvm use 22
nvm alias default 22

# Verify version
node --version  # Should show v22.x.x
```

#### Option 2: Using NodeSource Repository (Ubuntu/Debian)

```bash
# Remove old Node.js if installed via apt
sudo apt remove nodejs npm

# Install Node.js 22.x
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify version
node --version  # Should show v22.x.x
npm --version
```

#### Option 3: Using Binary Installation

```bash
# Download and install Node.js 22.x
cd /tmp
wget https://nodejs.org/dist/v22.11.0/node-v22.11.0-linux-x64.tar.xz
tar -xf node-v22.11.0-linux-x64.tar.xz
sudo cp -r node-v22.11.0-linux-x64/* /usr/local/

# Verify version
node --version
```

### Deployment Steps

1. **Verify Node.js version** (must be 20+):
   ```bash
   node --version
   ```

2. **On your production server**, navigate to the server directory:
   ```bash
   cd /var/www/otherProjects/Real-Fake-News/server
   ```

3. **Remove existing node_modules** (if copied from another machine or after Node.js upgrade):
   ```bash
   rm -rf node_modules package-lock.json
   ```

4. **Install dependencies directly on the production server**:
   ```bash
   npm install --include=optional --legacy-peer-deps
   ```

   The flags ensure:
   - `--include=optional`: `sharp`'s platform-specific optional dependencies are installed correctly
   - `--legacy-peer-deps`: Resolves peer dependency conflicts with `langchain` packages (safe for optional peer deps)

5. **Build the TypeScript code**:
   ```bash
   npm run build
   ```

6. **Start the server**:
   ```bash
   npm start
   ```

### Common Errors and Solutions

#### Error: "Unsupported engine" warnings
- **Cause**: Node.js version is too old (v18 or lower)
- **Solution**: Upgrade to Node.js 20+ using one of the methods above

#### Error: "Could not load the sharp module"
- **Cause**: Wrong platform binaries or Node.js version mismatch
- **Solution**: 
  1. Ensure Node.js is version 20+
  2. Remove `node_modules` and reinstall: `rm -rf node_modules && npm install --include=optional`

#### Error: "better-sqlite3" build errors
- **Cause**: Node.js version mismatch or missing build tools
- **Solution**: 
  1. Upgrade to Node.js 20+
  2. Install build essentials: `sudo apt-get install build-essential python3`

### Why These Requirements Exist

- **Node.js 20+**: Required by `better-sqlite3@12.4.1` and `simple-xml-to-json@1.2.3`
- **Platform-specific binaries**: `sharp` uses native C++ libraries compiled for specific CPU architectures
- **Never copy node_modules**: Always run `npm install` on the target machine to get correct binaries