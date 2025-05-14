import 'dotenv/config'

import axios from 'axios';
import cron from 'node-cron';

import { DB_NEWS_DATA_FILE } from '../config/constants';
import { createPost } from '../lib/lowdb/lowdbOperations';

const BASE_URL = 'https://newsdata.io/api/1/news';
const DAILY_TOKENS = 200;
const NUM_OF_ARTICLES_PER_TOKEN = 10;

// TODO: like this, it will be restarted every time we start up the project again
var remainingTokens: number = DAILY_TOKENS;
var dailyArticles: NewsItem[] = [];

cron.schedule('0 0 * * *', () => {  // Every day at midnight
  remainingTokens = DAILY_TOKENS;
  resetArticles();
  console.log('Daily tokens reset.');
});

export type NewsItem = {
    title: string;
    description: string;
}

export function getArticles(): NewsItem[] {
  return dailyArticles;
}

export function resetArticles() {
  dailyArticles = [];
}


// TODO: I want to get an arbitrary number of daily articles to use in any given moment.
export async function addNewsToTotal(numArticles: number = 10): Promise<boolean> {
  // TODO: perhaps I could just check the number of tokens left by asking the API at some other URL?
  // If there are no more tokens remaining, this function cannot be used.
  if (remainingTokens <= 0) {
    throw new Error("No more tokens remaining.");
  }
  if (remainingTokens * NUM_OF_ARTICLES_PER_TOKEN < numArticles) {
    throw new Error(`Not enough tokens remaining for ${numArticles} articles.`);
  }

  let neededApiRequests = Math.ceil(numArticles / NUM_OF_ARTICLES_PER_TOKEN);
  let nextPage: string = "";
  for (let i = 0; i < neededApiRequests; i++) {
    nextPage = await fetchNews(nextPage);
    if (nextPage === "") {
      return false;
    }
  }

  return true;
}

/**
 * Performs one news API call and adds the articles to the total.
 *
 * @param {string} page - The page of the current news to pull from.
 * @returns {string} The next page in the current news page that we could pull from.
 */
async function fetchNews(page: string = ""): Promise<string> {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        apikey: process.env.NEWSDATA_API_KEY,
        // country: 'us',       // Optional filter: only US news
        language: 'en',      // Optional: only English news
        category: 'top',     // Optional: top news category
      }
    });
    if (page !== "") {
      response.config.params.page = page;
    }    

    const articles = response.data.results;
    for (const article of articles) {
        // console.log('ID:', article.article_id);
        // console.log('Title:', article.title);
        // console.log('Description:', article.description);
        // console.log('---');

        // TODO: save API news article data to your own private data store for further uses
        // await createPost<ArticleScheme>(article, DB_NEWS_DATA_FILE);

        dailyArticles.push({ title: article.title, description: article.description })
    }    

    remainingTokens--;
    return response.data.nextPage;
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return "";
  }
}

