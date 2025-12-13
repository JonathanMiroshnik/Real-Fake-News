import 'dotenv/config'
import axios from 'axios';
import cron from 'node-cron';
import { NEWS_API_BASE_URL, NEWS_API_DAILY_TOKENS } from '../config/constants.js';
import { getAllPosts } from '../lib/database/sqliteOperations.js';
import { newsDatabaseConfig } from '../lib/database/databaseConfigurations.js';
import { standardizeDate } from './timeService.js';
import { debugLog } from '../utils/debugLogger.js';

// TODO: like this, it will be restarted every time we start up the project again
/**
 * Number of remaining daily News API tokens
 */
export var remainingTokens: number = NEWS_API_DAILY_TOKENS;

// Every day at midnight
cron.schedule('0 0 * * *', () => {
  remainingTokens = NEWS_API_DAILY_TOKENS;
  debugLog('Daily tokens reset.');
});

export type NewsItem = {
  article_id: string;
  title: string;
  description: string;
  pubDate: string;
  pubDateTZ: string;
}

/**
 * Performs one news API call and adds the articles to the total.
 *
 * @param {string} page - The page of the current news to pull from.
 * @returns {string} The next page in the current news page that we could pull from.
 */
export async function fetchNews(page: string = ""): Promise<[any[], nextPage: string]> {
  if (remainingTokens <= 0) {
    throw new Error("No more tokens remaining to do another API call.");
  }
  
  try {
    const response = await axios.get(NEWS_API_BASE_URL, {
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

    remainingTokens--;
    return [[...response.data.results], response.data.nextPage.toString()];   
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return [[], ""];
  }
}

/**
 * Used to get news articles after a given date
 * @param startDate Given date after which articles are returned
 * @returns News Items that were published after the given date
 */
export async function getAllNewsArticlesAfterDate(startDate: Date): Promise<NewsItem[]> {
    const allArticles: NewsItem[] = await getAllPosts<NewsItem>(newsDatabaseConfig);

    const retArticles = allArticles.filter(article => {
        const timestamp = standardizeDate(article.pubDate, article.pubDateTZ);

        try {
            const articleDate = new Date(timestamp);
            const startTime = startDate.getTime();
            return articleDate.getTime() > startTime;
        } catch (e) {
            console.error('Invalid date format:', timestamp);
            return false;
        }
    });

    return retArticles;
}
