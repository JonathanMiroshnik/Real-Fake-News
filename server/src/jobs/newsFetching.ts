import { NEWS_API_NUM_OF_ARTICLES_PER_TOKEN } from '../config/constants.js';
import { insert } from '../lib/database/sqliteOperations.js';
import { newsDatabaseConfig } from '../lib/database/databaseConfigurations.js';
import { NewsItem } from '../services/newsService.js';
import type { NewsSource } from '../types/contentPorts.js';
import { ports as defaultPorts } from '../services/contentSources/index.js';

/**
 * Fetches real news into `news_items`, the raw material the writing jobs rewrite.
 *
 * The budget check reads `source.remainingCalls()` rather than the module-level
 * `remainingTokens` counter: the token count belongs to the live provider, and a
 * job asking *the source* how much it has left works the same for a mock.
 *
 * Partial pages are written before the count is re-checked, so a page that ends
 * early leaves the rows it did deliver in the database rather than discarding
 * them; the return value is whatever the last page yielded, matching the previous
 * behaviour.
 *
 * @param numArticles How many items to try to fetch this cycle.
 * @param source The news source to read from; defaults to the configured one.
 * @returns The items from the final page, or `[]` when the source is exhausted.
 */
export async function addNewsToTotal(
  numArticles: number = 10,
  source: NewsSource = defaultPorts.news,
): Promise<NewsItem[]> {
  const callsLeft = source.remainingCalls();
  const articlesAvailable = callsLeft * NEWS_API_NUM_OF_ARTICLES_PER_TOKEN;

  if (callsLeft <= 0) {
    throw new Error('No more tokens remaining.');
  }
  if (articlesAvailable < numArticles) {
    throw new Error(`Not enough tokens remaining for ${numArticles} articles.`);
  }

  const neededApiRequests = Math.ceil(numArticles / NEWS_API_NUM_OF_ARTICLES_PER_TOKEN);
  let nextPage: string = '';
  let retArticles: NewsItem[] = [];

  for (let i = 0; i < neededApiRequests; i++) {
    const page = await source.fetchPage(nextPage);
    retArticles = page.items;

    await insertArticlesToDatabase(retArticles, source.contentSource);

    nextPage = page.nextPage;
    if (nextPage === '') {
      return [];
    }
  }

  return retArticles;
}

/**
 * Inserts news items, stamping each with the source it came from.
 *
 * The stamp matters more here than anywhere else: these rows are real-world news
 * fed to the writer jobs, and without it a mock item is indistinguishable from one
 * fetched from the news API (`plans/dev-content-marking.md`).
 */
async function insertArticlesToDatabase(
  articles: NewsItem[],
  contentSource: NewsItem['contentSource'],
): Promise<NewsItem[]> {
  const retArticles: NewsItem[] = [];

  for (const article of articles) {
    const rowToInsert: NewsItem = { ...article, contentSource };
    const wasInserted = await insert<NewsItem>(newsDatabaseConfig, rowToInsert);
    if (wasInserted) {
      retArticles.push({
        article_id: article.article_id,
        title: article.title,
        description: article.description,
        pubDate: article.pubDate,
        pubDateTZ: article.pubDateTZ,
      });
    }
  }

  return retArticles;
}

// TODO: I want to get an arbitrary number of daily articles to use in any given moment.
