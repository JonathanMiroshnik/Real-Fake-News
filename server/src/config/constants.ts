import { Writer } from '../types/writer.js';

// Legacy LowDB file paths (no longer used - data is now in SQLite)
// Kept for reference only
// const DB_BLOG_POST_FILE: string = "data/blogPosts.json";
// const DB_NEWS_DATA_FILE: string = "data/newsData.json"
// const DB_FEATURED_BLOG_POST_FILE: string = "data/featuredBlogPosts.json";
// const DB_USERS_FILE: string = "data/users.json";
// const DB_WRITERS_FILE: string = "data/writers.json";

// Calculated in milliseconds
const MILLISECS_IN_SEC: number = 1000;
const DAY_MILLISECS = 24 * 60 * 60 * 1000;
const ONE_HOUR_MILLISECS = 60 * 60 * 1000;
const TEN_MINUTES_MILLISECONDS = 10 * 60 * 1000;

const MINIMAL_NUM_DAILY_ARTICLES = 10;
const MINIMAL_NUM_DAILY_RECIPES = 2;

const NEWS_API_BASE_URL = 'https://newsdata.io/api/1/latest'; // /news';
const NEWS_API_DAILY_TOKENS = 200;
const NEWS_API_NUM_OF_ARTICLES_PER_TOKEN = 10;

// "Recent News" is any article between now and this much time ago:
const RECENT_NEWS_ARTICLES_TIME_THRESHOLD: number = ONE_HOUR_MILLISECS * 24;

// Article fetching fallback constants (in minutes)
const MIN_MINUTES_BEFORE_TO_CHECK = 24 * 60; // One day
const MAX_MINUTES_BEFORE_TO_CHECK = 24 * 60 * 4; // 4 days
const FALLBACK_MINUTES_BEFORE_TO_CHECK = 365 * 24 * 60; // 1 year (fallback to get all articles if needed)
const MIN_ACCEPTABLE_ARTICLES = 15;

const VALID_CATEGORIES = ['Politics', 'Sports', 'Culture', 'Economics', 'Technology', 'Food'];

const EDITOR: Writer = {
  key: 'EDITOR',
  name: 'The Editor',
  description:
    'A professional editor of a newspaper, with a good sense of laying out complex topics for a general audience.',
  systemPrompt:
    'You are a professional editor of a newspaper, with a good sense of laying out complex topics for a general audience.',
  // profileImage?: string,
  createdAt: new Date(0).toString(),
  updatedAt: new Date().toString(),
};

// Default configuration values for site-wide settings.
// These are used as fallbacks when no value exists in the site_config DB table.
// The `description` field is shown as a tooltip in the admin configuration page.
interface ConfigSetting {
  defaultValue: string;
  description: string;
  type: 'number' | 'boolean' | 'string';
}

const DEFAULT_CONFIG: Record<string, ConfigSetting> = {
  articlesPerDay: {
    defaultValue: String(MINIMAL_NUM_DAILY_ARTICLES),
    description:
      'The minimum number of AI-generated articles the system will produce daily. Lower values reduce API costs but result in less fresh content.',
    type: 'number',
  },
  recipesPerDay: {
    defaultValue: String(MINIMAL_NUM_DAILY_RECIPES),
    description:
      'The minimum number of new recipes generated daily. Increase for more variety in the recipe section.',
    type: 'number',
  },
  articleGenerationIntervalHours: {
    defaultValue: '8',
    description:
      'How frequently the article generation job runs on average. Lower values generate content more frequently but consume more API credits.',
    type: 'number',
  },
  newsFetchIntervalHours: {
    defaultValue: '2',
    description:
      'How frequently the system fetches recent news from the NewsData API. Too frequent may exhaust daily API tokens.',
    type: 'number',
  },
  minAcceptableArticles: {
    defaultValue: String(MIN_ACCEPTABLE_ARTICLES),
    description:
      'If fewer than this many recent articles exist, the system falls back to fetching older news to fill gaps.',
    type: 'number',
  },
  enableScheduledJobs: {
    defaultValue: 'true',
    description:
      'When enabled, the system automatically generates articles, fetches news, and creates recipes on a schedule. When disabled, content is only generated manually.',
    type: 'boolean',
  },
};

export {
  MINIMAL_NUM_DAILY_ARTICLES,
  MINIMAL_NUM_DAILY_RECIPES,
  MILLISECS_IN_SEC,
  DAY_MILLISECS,
  ONE_HOUR_MILLISECS,
  TEN_MINUTES_MILLISECONDS,
  NEWS_API_BASE_URL,
  NEWS_API_DAILY_TOKENS,
  NEWS_API_NUM_OF_ARTICLES_PER_TOKEN,
  RECENT_NEWS_ARTICLES_TIME_THRESHOLD,
  MIN_MINUTES_BEFORE_TO_CHECK,
  MAX_MINUTES_BEFORE_TO_CHECK,
  FALLBACK_MINUTES_BEFORE_TO_CHECK,
  MIN_ACCEPTABLE_ARTICLES,
  VALID_CATEGORIES,
  EDITOR,
  ConfigSetting,
  DEFAULT_CONFIG,
};
