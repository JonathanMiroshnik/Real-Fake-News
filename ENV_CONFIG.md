# =============================================================================
# REAL FAKE NEWS - Complete Environment & Configuration Reference
# =============================================================================
# This file documents ALL environment variables, config files, and constants
# used across the entire project. Copy relevant sections to .env files in
# server/, client/, and admin/ subdirectories.
#
# Note: Vite-based applications (client/ and admin/) require the VITE_ prefix
# for environment variables to be accessible in the browser.
# =============================================================================

# =============================================================================
# SERVER (Backend) - Node.js/Express
# =============================================================================
# Location: server/.env
# Access: process.env.VARIABLE_NAME

# Server Configuration
NODE_ENV=development                    # Node environment (development/production)
PORT=5001                               # Server port number
LOCAL_DEV_BACKEND=false                 # If "true", uses "/" instead of "/api" prefix for routes

# Database Configuration
DATABASE_PATH=                          # Optional: Custom SQLite database file path (default used if empty)

# Scheduled Jobs
ENABLE_SCHEDULED_JOBS=true              # Enable/disable background jobs (news fetching, article writing)

# CORS Configuration
CLIENT_URL=http://localhost:5173        # Allowed client URL for CORS requests

# Admin Authentication
ADMIN_PASSWORD=changeme123              # Admin login password (CHANGE IN PRODUCTION!)

# API Keys - External Services
DEEPSEEK_API_KEY=your_deepseek_api_key_here      # DeepSeek API for LLM operations
NEWSDATA_API_KEY=your_newsdata_api_key_here      # NewsData.io API for fetching real news
RUNWARE_API_KEY=your_runware_api_key_here        # Runware API for AI image generation
RUNWARE_IMAGE_MODEL=runware:z-image@turbo        # Runware image model to use

# Email Service (Gmail)
GMAIL_USER=your_gmail_address@gmail.com          # Gmail account for sending emails
GMAIL_APP_PASSWORD=your_gmail_app_password_here  # Gmail App Password (generate at Google Account settings)

# Optional - Currently commented out in code
# GOOGLE_CLIENT_ID=your_google_client_id_here
# JWT_SECRET=your_jwt_secret_here

# =============================================================================
# CLIENT (Frontend) - React/Vite
# =============================================================================
# Location: client/.env
# Access: import.meta.env.VITE_VARIABLE_NAME

# Backend API Configuration
VITE_BACKEND_DEV_MODE=true             # "true" = localhost:5001, "false"/undefined = production
VITE_API_BASE_DEV=http://localhost:5001         # Custom dev backend URL (optional override)
VITE_API_BASE_PROD=https://real.sensorcensor.xyz # Custom prod backend URL (optional override)
VITE_USE_RELATIVE_API=false            # If "true", uses relative "/api" URLs (for nginx proxy)

# Debug & UI Configuration
VITE_DEBUG_LOGS=true                    # Enable debug console logging
VITE_NO_ARTICLES_MESSAGE_DELAY=3000    # Delay (ms) before showing "No articles" message (default: 3000)

# Optional - Currently commented out in code
# VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# =============================================================================
# ADMIN (Admin Panel) - Svelte/Vite
# =============================================================================
# Location: admin/.env
# Access: import.meta.env.VITE_VARIABLE_NAME

# Backend API Configuration
VITE_BACKEND_DEV_MODE=true             # "true" = localhost:5001, "false"/undefined = production
VITE_API_BASE_DEV=http://localhost:5001         # Custom dev backend URL (optional override)
VITE_API_BASE_PROD=https://real.sensorcensor.xyz # Custom prod backend URL (optional override)
VITE_USE_RELATIVE_API=false            # If "true", uses relative "/api" URLs (for nginx proxy)

# Frontend Development Mode
VITE_FRONTEND_DEV_MODE=true            # Controls client URL generation for article links
# VITE_LOCAL_DEV_MODE=true              # Backward compatibility alias (also works)

# Client URL Configuration
VITE_CLIENT_URL_DEV=http://localhost:5173       # Development client URL
VITE_CLIENT_URL_PROD=https://real.sensorcensor.xyz # Production client URL

# Admin Panel Configuration
VITE_ADMIN_PAGE_BUFFER_SIZE=2           # Number of pages to buffer when loading articles

# =============================================================================
# CONFIG FILES
# =============================================================================

# -----------------------------------------------------------------------------
# Server Config Files
# -----------------------------------------------------------------------------

# server/src/config/constants.ts
# Purpose: Centralized constants for server-side operations
# Contains:
#   - Time constants: MILLISECS_IN_SEC, DAY_MILLISECS, ONE_HOUR_MILLISECS, TEN_MINUTES_MILLISECONDS
#   - Article constants: MINIMAL_NUM_DAILY_ARTICLES (10)
#   - News API constants: NEWS_API_BASE_URL, NEWS_API_DAILY_TOKENS (200), NEWS_API_NUM_OF_ARTICLES_PER_TOKEN (10)
#   - Time thresholds: RECENT_NEWS_ARTICLES_TIME_THRESHOLD (24 hours)
#   - Article fetching: MIN_MINUTES_BEFORE_TO_CHECK (1 day), MAX_MINUTES_BEFORE_TO_CHECK (4 days), 
#                       FALLBACK_MINUTES_BEFORE_TO_CHECK (1 year), MIN_ACCEPTABLE_ARTICLES (15)
#   - Categories: VALID_CATEGORIES array ["Politics", "Sports", "Culture", "Economics", "Technology", "Food"]
#   - Editor: EDITOR Writer object (special writer for editorial content)
# Used in: blogService.ts, newsService.ts, blogWriting.ts, newsFetching.ts, featuredArticleService.ts, 
#          scheduler.ts, blogController.ts

# server/src/lib/database/databaseConfigurations.ts
# Purpose: Database configuration objects for SQLite operations
# Contains: DatabaseConfig interfaces and implementations for:
#   - blogDatabaseConfig: ArticleScheme operations
#   - featuredBlogDatabaseConfig: FeaturedArticleScheme operations
#   - newsDatabaseConfig: NewsItem operations
#   - writerDatabaseConfig: Writer operations
# Used in: sqliteOperations.ts (database CRUD operations)

# server/src/lib/database/database.ts
# Purpose: SQLite database initialization and connection
# Uses: DATABASE_PATH environment variable (optional)
# Used in: All database operations throughout the server

# -----------------------------------------------------------------------------
# Client Config Files
# -----------------------------------------------------------------------------

# client/src/config/apiConfig.ts
# Purpose: Centralized API URL configuration for client
# Functions:
#   - getApiBaseUrl(): Returns base URL (without /api)
#   - getApiBaseUrlWithPrefix(): Returns base URL with /api prefix
# Uses: VITE_BACKEND_DEV_MODE, VITE_USE_RELATIVE_API, VITE_API_BASE_DEV, VITE_API_BASE_PROD
# Used in: articleService.ts, imageService.ts, TriviaGame.tsx

# client/src/services/articleService.ts
# Purpose: Article fetching and category management
# Contains:
#   - CATEGORIES array: NewsCategory definitions with display names
#   - Article fetching constants: MIN_MINUTES_BEFORE_TO_CHECK, MAX_MINUTES_BEFORE_TO_CHECK, 
#                                FALLBACK_MINUTES_BEFORE_TO_CHECK, MIN_ACCEPTABLE_ARTICLES
# Functions: getRelevantArticles(), pullRecentArticles(), getArticleByKey(), groupArticlesByCategories()
# Used in: HomePage.tsx, ArticlePage.tsx, CategoryPage.tsx, ArticleList components

# client/src/services/timeService.ts
# Purpose: Time conversion utilities
# Contains: MINUTE_MILLISECS, HOUR_MILLISECS, DAY_MILLISECS
# Used in: Time-related calculations throughout client

# client/src/utils/debugLogger.ts
# Purpose: Conditional debug logging utility
# Functions: debugLog(), debugWarn(), debugError()
# Uses: VITE_DEBUG_LOGS environment variable
# Used in: All client components and services

# -----------------------------------------------------------------------------
# Admin Config Files
# -----------------------------------------------------------------------------

# admin/src/lib/apiConfig.ts
# Purpose: Centralized API URL configuration for admin panel
# Functions:
#   - getApiBaseUrl(): Returns base URL (without /api)
#   - getApiBaseUrlWithPrefix(): Returns base URL with /api prefix
#   - getClientUrl(): Returns client URL based on frontend dev mode
# Uses: VITE_BACKEND_DEV_MODE, VITE_USE_RELATIVE_API, VITE_FRONTEND_DEV_MODE, 
#       VITE_CLIENT_URL_DEV, VITE_CLIENT_URL_PROD
# Used in: All admin routes and components

# =============================================================================
# CONSTANTS REFERENCE
# =============================================================================

# Server Constants (server/src/config/constants.ts)
# --------------------------------------------------
# MINIMAL_NUM_DAILY_ARTICLES (10)
#   - Used in: blogWriting.ts - Minimum articles to generate per day
#
# NEWS_API_BASE_URL ('https://newsdata.io/api/1/latest')
#   - Used in: newsService.ts - Base URL for NewsData.io API
#
# NEWS_API_DAILY_TOKENS (200)
#   - Used in: newsService.ts - Daily API token limit
#
# NEWS_API_NUM_OF_ARTICLES_PER_TOKEN (10)
#   - Used in: newsFetching.ts - Articles per API token
#
# RECENT_NEWS_ARTICLES_TIME_THRESHOLD (24 hours)
#   - Used in: blogWriting.ts - Time window for "recent" news
#
# MIN_MINUTES_BEFORE_TO_CHECK (1 day)
#   - Used in: blogService.ts - Minimum time range for article fetching
#
# MAX_MINUTES_BEFORE_TO_CHECK (4 days)
#   - Used in: blogService.ts, articleService.ts - Maximum time range for article fetching
#
# FALLBACK_MINUTES_BEFORE_TO_CHECK (1 year)
#   - Used in: blogService.ts, articleService.ts - Fallback time range if not enough articles found
#
# MIN_ACCEPTABLE_ARTICLES (15)
#   - Used in: blogService.ts - Minimum acceptable number of articles before using fallback
#
# VALID_CATEGORIES (["Politics", "Sports", "Culture", "Economics", "Technology", "Food"])
#   - Used in: blogService.ts, featuredArticleService.ts - Valid article categories
#
# EDITOR (Writer object)
#   - Used in: Various services - Special "Editor" writer for editorial content
#
# Time Constants
#   - MILLISECS_IN_SEC (1000): Used in scheduler.ts
#   - DAY_MILLISECS (24 hours): Used in blogController.ts
#   - ONE_HOUR_MILLISECS (1 hour): Used in blogWriting.ts, blogController.ts, scheduler.ts
#   - TEN_MINUTES_MILLISECONDS (10 min): Available but not currently used

# Client Constants (client/src/services/articleService.ts)
# --------------------------------------------------------
# CATEGORIES (NewsCategory array)
#   - Used in: HomePage.tsx, CategoryPage.tsx, ArticleList components
#   - Defines: Display names for each category ("Unreal Politics", "Extraordinary Sports", etc.)
#
# Article Fetching Constants (same as server, but defined locally)
#   - MIN_MINUTES_BEFORE_TO_CHECK, MAX_MINUTES_BEFORE_TO_CHECK, 
#     FALLBACK_MINUTES_BEFORE_TO_CHECK, MIN_ACCEPTABLE_ARTICLES
#   - Used in: articleService.ts - Article fetching fallback logic

# Client Time Constants (client/src/services/timeService.ts)
# -----------------------------------------------------------
# MINUTE_MILLISECS (60,000)
# HOUR_MILLISECS (3,600,000)
# DAY_MILLISECS (86,400,000)
#   - Used in: Time-related calculations throughout client

# Client Image Constants (client/src/services/imageService.ts)
# -------------------------------------------------------------
# DEFAULT_IMAGE ("planet.jpg")
#   - Used in: Image fallback when article has no image

# Game Constants (client/src/components/Games/)
# ----------------------------------------------
# TicTacToeGame.tsx:
#   - BOARD_SIDE_LENGTH (3): Board dimensions
#   - SERVER_SIDE: Backend URL (hardcoded, TODO: should use config)
#   - aiSymbol: AI player symbol

# =============================================================================
# QUICK START GUIDE
# =============================================================================
#
# 1. Copy sections to create .env files:
#    - server/.env (SERVER section)
#    - client/.env (CLIENT section)
#    - admin/.env (ADMIN section)
#
# 2. Required API Keys (get from respective services):
#    - DEEPSEEK_API_KEY: https://platform.deepseek.com/
#    - NEWSDATA_API_KEY: https://newsdata.io/
#    - RUNWARE_API_KEY: https://runware.ai/
#
# 3. Gmail Setup (if using email service):
#    - GMAIL_USER: Your Gmail address
#    - GMAIL_APP_PASSWORD: Generate at https://myaccount.google.com/apppasswords
#
# 4. Security:
#    - Change ADMIN_PASSWORD from default!
#    - Never commit .env files to version control
#
# 5. Development Setup:
#    - Set VITE_BACKEND_DEV_MODE=true in client/ and admin/ for local development
#    - Ensure server is running on PORT (default: 5001)
#    - Client runs on port 5173, Admin on its own port
#
# =============================================================================
# IMPORTANT NOTES
# =============================================================================
#
# 1. Environment Variable Access:
#    - Server: process.env.VARIABLE_NAME (no prefix)
#    - Client/Admin: import.meta.env.VITE_VARIABLE_NAME (requires VITE_ prefix)
#
# 2. Config File Locations:
#    - Server constants: server/src/config/constants.ts
#    - Client API config: client/src/config/apiConfig.ts
#    - Admin API config: admin/src/lib/apiConfig.ts
#    - Database config: server/src/lib/database/databaseConfigurations.ts
#
# 3. Constants vs Environment Variables:
#    - Constants: Hardcoded values in config files (timeouts, limits, categories)
#    - Environment Variables: Runtime configuration (API keys, URLs, passwords)
#
# 4. File Organization:
#    - Each subdirectory (server/, client/, admin/) has its own .env file
#    - Config files are in src/config/ or src/lib/ directories
#    - Constants are centralized in constants.ts files
#
# 5. Version Control:
#    - .env files are in .gitignore (never commit)
#    - ENV_CONFIG.example is committed (template only)
#    - Config files (.ts) are committed (contain logic, not secrets)
#
# =============================================================================
