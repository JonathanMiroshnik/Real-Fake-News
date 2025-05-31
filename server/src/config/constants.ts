import { Writer } from "../types/writer";

// LowDB database locations
const DB_BLOG_POST_FILE: string = "data/blogPosts.json";
const DB_NEWS_DATA_FILE: string = "data/newsData.json"
const DB_FEATURED_BLOG_POST_FILE: string = "data/featuredBlogPosts.json";
const DB_USERS_FILE: string = "data/users.json";
const DB_WRITERS_FILE: string = "data/writers.json";

// Calculated in milliseconds
const MILLISECS_IN_SEC: number = 1000;
const DAY_MILLISECS = 24 * 60 * 60 * 1000;
const ONE_HOUR_MILLISECS = 60 * 60 * 1000;
const TEN_MINUTES_MILLISECONDS = 10*60*1000;

const MINIMAL_NUM_DAILY_ARTICLES = 10;

const NEWS_API_BASE_URL = 'https://newsdata.io/api/1/latest'; // /news';
const NEWS_API_DAILY_TOKENS = 200;
const NEWS_API_NUM_OF_ARTICLES_PER_TOKEN = 10;

const VALID_CATEGORIES = ["Politics", "Sports", "Culture", "Economics", "Technology", "Food"];

const EDITOR: Writer = {
    key: "EDITOR",
    name: "The Editor",
    description: "A professional editor of a newspaper, with a good sense of laying out complex topics for a general audience.",
    systemPrompt: "You are a professional editor of a newspaper, with a good sense of laying out complex topics for a general audience.",
    // profileImage?: string,
    createdAt: (new Date(0)).toString(),
    updatedAt: (new Date()).toString()
}

export { DB_BLOG_POST_FILE, DB_NEWS_DATA_FILE, DB_FEATURED_BLOG_POST_FILE, DB_USERS_FILE, DB_WRITERS_FILE, 
         
         MINIMAL_NUM_DAILY_ARTICLES, 

         MILLISECS_IN_SEC, DAY_MILLISECS, ONE_HOUR_MILLISECS, TEN_MINUTES_MILLISECONDS, 

         NEWS_API_BASE_URL, NEWS_API_DAILY_TOKENS, NEWS_API_NUM_OF_ARTICLES_PER_TOKEN,
         
         VALID_CATEGORIES,
         
         EDITOR };