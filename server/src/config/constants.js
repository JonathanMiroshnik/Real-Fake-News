"use strict";
exports.__esModule = true;
exports.EDITOR = exports.VALID_CATEGORIES = exports.NEWS_API_NUM_OF_ARTICLES_PER_TOKEN = exports.NEWS_API_DAILY_TOKENS = exports.NEWS_API_BASE_URL = exports.TEN_MINUTES_MILLISECONDS = exports.ONE_HOUR_MILLISECS = exports.DAY_MILLISECS = exports.MILLISECS_IN_SEC = exports.MINIMAL_NUM_DAILY_ARTICLES = exports.DB_WRITERS_FILE = exports.DB_USERS_FILE = exports.DB_FEATURED_BLOG_POST_FILE = exports.DB_NEWS_DATA_FILE = exports.DB_BLOG_POST_FILE = void 0;
// LowDB database locations
var DB_BLOG_POST_FILE = "data/blogPosts.json";
exports.DB_BLOG_POST_FILE = DB_BLOG_POST_FILE;
var DB_NEWS_DATA_FILE = "data/newsData.json";
exports.DB_NEWS_DATA_FILE = DB_NEWS_DATA_FILE;
var DB_FEATURED_BLOG_POST_FILE = "data/featuredBlogPosts.json";
exports.DB_FEATURED_BLOG_POST_FILE = DB_FEATURED_BLOG_POST_FILE;
var DB_USERS_FILE = "data/users.json";
exports.DB_USERS_FILE = DB_USERS_FILE;
var DB_WRITERS_FILE = "data/writers.json";
exports.DB_WRITERS_FILE = DB_WRITERS_FILE;
// Calculated in milliseconds
var MILLISECS_IN_SEC = 1000;
exports.MILLISECS_IN_SEC = MILLISECS_IN_SEC;
var DAY_MILLISECS = 24 * 60 * 60 * 1000;
exports.DAY_MILLISECS = DAY_MILLISECS;
var ONE_HOUR_MILLISECS = 60 * 60 * 1000;
exports.ONE_HOUR_MILLISECS = ONE_HOUR_MILLISECS;
var TEN_MINUTES_MILLISECONDS = 10 * 60 * 1000;
exports.TEN_MINUTES_MILLISECONDS = TEN_MINUTES_MILLISECONDS;
var MINIMAL_NUM_DAILY_ARTICLES = 10;
exports.MINIMAL_NUM_DAILY_ARTICLES = MINIMAL_NUM_DAILY_ARTICLES;
var NEWS_API_BASE_URL = 'https://newsdata.io/api/1/news';
exports.NEWS_API_BASE_URL = NEWS_API_BASE_URL;
var NEWS_API_DAILY_TOKENS = 200;
exports.NEWS_API_DAILY_TOKENS = NEWS_API_DAILY_TOKENS;
var NEWS_API_NUM_OF_ARTICLES_PER_TOKEN = 10;
exports.NEWS_API_NUM_OF_ARTICLES_PER_TOKEN = NEWS_API_NUM_OF_ARTICLES_PER_TOKEN;
var VALID_CATEGORIES = ["Politics", "Sports", "Culture", "Economics", "Technology", "Food"];
exports.VALID_CATEGORIES = VALID_CATEGORIES;
var EDITOR = {
    key: "EDITOR",
    name: "The Editor",
    description: "A professional editor of a newspaper, with a good sense of laying out complex topics for a general audience.",
    systemPrompt: "You are a professional editor of a newspaper, with a good sense of laying out complex topics for a general audience.",
    // profileImage?: string,
    createdAt: (new Date(0)).toString(),
    updatedAt: (new Date()).toString()
};
exports.EDITOR = EDITOR;
