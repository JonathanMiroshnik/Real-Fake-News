import 'dotenv/config'
import axios from 'axios';
import cron from 'node-cron';
import { NEWS_API_BASE_URL, NEWS_API_DAILY_TOKENS } from '../config/constants';

// TODO: like this, it will be restarted every time we start up the project again
export var remainingTokens: number = NEWS_API_DAILY_TOKENS;

cron.schedule('0 0 * * *', () => {  // Every day at midnight
  remainingTokens = NEWS_API_DAILY_TOKENS;
  console.log('Daily tokens reset.');
});

export type NewsItem = {
  article_id: string;
  title: string;
  description: string;
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
