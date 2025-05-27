import 'dotenv/config'

import axios from 'axios';
import cron from 'node-cron';

import { NEWS_API_BASE_URL, NEWS_API_DAILY_TOKENS, NEWS_API_NUM_OF_ARTICLES_PER_TOKEN } from '../config/constants';
import { newsDatabaseConfig } from '../lib/lowdb/databaseConfigurations';
import { createPost } from '../lib/lowdb/lowdbOperations.js';
import { getBooleanResponse } from './llmService.js';

// TODO: like this, it will be restarted every time we start up the project again
var remainingTokens: number = NEWS_API_DAILY_TOKENS;

cron.schedule('0 0 * * *', () => {  // Every day at midnight
  remainingTokens = NEWS_API_DAILY_TOKENS;
  console.log('Daily tokens reset.');
});

export type NewsItem = {
  article_id: string;
  title: string;
  description: string;
}

// TODO: I want to get an arbitrary number of daily articles to use in any given moment.
export async function addNewsToTotal(numArticles: number = 10): Promise<NewsItem[]> {
  // TODO: perhaps I could just check the number of tokens left by asking the API at some other URL?
  // If there are no more tokens remaining, this function cannot be used.
  if (remainingTokens <= 0) {
    throw new Error("No more tokens remaining.");
  }
  if (remainingTokens * NEWS_API_NUM_OF_ARTICLES_PER_TOKEN < numArticles) {
    throw new Error(`Not enough tokens remaining for ${numArticles} articles.`);
  }

  let neededApiRequests = Math.ceil(numArticles / NEWS_API_NUM_OF_ARTICLES_PER_TOKEN);
  let nextPage: string = "";

  let retArticles: NewsItem[] = [];
  let gatherPage: string;
  for (let i = 0; i < neededApiRequests; i++) {
    [retArticles, gatherPage] = await fetchNews(nextPage);
    // console.log("ret articles", retArticles.length, "page", gatherPage);
    nextPage = gatherPage;
    if (nextPage === "") {
      return [];
    }
  }
  
  return retArticles;
}

/**
 * Performs one news API call and adds the articles to the total.
 *
 * @param {string} page - The page of the current news to pull from.
 * @returns {string} The next page in the current news page that we could pull from.
 */
async function fetchNews(page: string = ""): Promise<[retArticles: NewsItem[], nextPage: string]> {
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

    var retArticles = [];
    const articles = response.data.results;
    for (const article of articles) {
      // TODO: add topics filter list in .env or outside in general
      const questionPrompt = `
        Is the following article title and/or description related to the following topics?\n
        Topics: Israel, Gaza, IDF\n
        Article Title: ${article.title}\n
        Article Description: ${article.description}\n
      `;

      // TODO: perhaps 10 articles at once and remove the ones that dont work out and basically return a 10 long json boolean check? 
      // const boolResponse: boolean = await getBooleanResponse(questionPrompt);
      // console.log("Is this related?", boolResponse);
      // if (!boolResponse) {
        if (await createPost<NewsItem>(article, newsDatabaseConfig)) {
          retArticles.push({ article_id: article.article_id, title: article.title, description: article.description });
        }
      // }      
    }    

    remainingTokens--;
    return [[...retArticles], response.data.nextPage.toString()];
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return [[], ""];
  }
}
