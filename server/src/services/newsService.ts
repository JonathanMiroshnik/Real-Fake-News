import 'dotenv/config';
import axios from 'axios';
import { NEWS_API_BASE_URL } from '../config/constants.js';
import { findAll } from '../lib/database/sqliteOperations.js';
import { newsDatabaseConfig } from '../lib/database/databaseConfigurations.js';
import { standardizeDate } from './timeService.js';
import type { ContentSource } from '../types/contentSource.js';

export type NewsItem = {
  article_id: string;
  title: string;
  description: string;
  pubDate: string;
  pubDateTZ: string;
  contentSource?: ContentSource;
};

/**
 * Performs one news API call and returns the articles.
 *
 * Unmetered on purpose: the daily budget belongs to `LiveNewsSource`, which owns
 * the counter, charges it and refills it. This function used to check and
 * decrement a module-level `let`, which made the budget global state readable and
 * spendable from anywhere — and left the count wrong as soon as two callers
 * existed. The port is the only caller, so the charge happens there.
 *
 * @param {string} page - The page of the current news to pull from.
 * @returns {string} The next page in the current news page that we could pull from.
 */
export async function fetchNews(page: string = ''): Promise<[any[], nextPage: string]> {
  try {
    const response = await axios.get(NEWS_API_BASE_URL, {
      params: {
        apikey: process.env.NEWSDATA_API_KEY,
        // country: 'us',       // Optional filter: only US news
        language: 'en', // Optional: only English news
        category: 'top', // Optional: top news category
      },
    });
    if (page !== '') {
      response.config.params.page = page;
    }

    return [[...response.data.results], response.data.nextPage.toString()];
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return [[], ''];
  }
}

/**
 * Used to get news articles after a given date
 *
 * @param startDate Given date after which articles are returned
 * @param contentSource When given, only articles from that origin are returned.
 * @returns News Items that were published after the given date
 */
export async function getAllNewsArticlesAfterDate(
  startDate: Date,
  contentSource?: NewsItem['contentSource'],
): Promise<NewsItem[]> {
  const allArticles: NewsItem[] = await findAll<NewsItem>(newsDatabaseConfig);
  const candidates = contentSource
    ? allArticles.filter((article) => article.contentSource === contentSource)
    : allArticles;

  const retArticles = candidates.filter((article) => {
    const timestamp = standardizeDate(article.pubDate, article.pubDateTZ);

    try {
      const articleDate = new Date(timestamp);
      const startTime = startDate.getTime();
      return articleDate.getTime() > startTime;
    } catch {
      console.error('Invalid date format:', timestamp);
      return false;
    }
  });

  return retArticles;
}
