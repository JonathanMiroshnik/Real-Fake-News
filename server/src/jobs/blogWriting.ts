import { randomInt } from 'crypto';
import {
  MINIMAL_NUM_DAILY_ARTICLES,
  RECENT_NEWS_ARTICLES_TIME_THRESHOLD,
} from '../config/constants.js';
import { writeBlogPost } from '../services/blogService.js';
import { getAllPostsAfterDateBySource } from '../services/contentSourceQueries.js';
import { getAllNewsArticlesAfterDate } from '../services/newsService.js';
import { NewsItem } from '../services/newsService.js';
import { getRandomWriter } from '../services/writerService.js';
import type { ContentPorts } from '../types/contentPorts.js';
import { ports as defaultPorts, JOBS_TIME_SCALE } from '../services/contentSources/index.js';
import type { RandomBelow } from '../utils/random.js';

/** How the job's two random choices are made — see `utils/random.ts`. */
export interface BlogWritingOptions {
  ports?: ContentPorts;
  randomBelow?: RandomBelow;
}

/** A time window compressed by `JOBS_TIME_SCALE` — see `jobs/scheduler.ts`. */
function scaledInterval(intervalMillis: number): number {
  return intervalMillis / JOBS_TIME_SCALE;
}

// Responsible for the state machine of the blog writers
export async function generateScheduledArticles(
  writingInterval: number,
  options: BlogWritingOptions = {},
) {
  const ports = options.ports ?? defaultPorts;
  const randomBelow = options.randomBelow ?? randomInt;

  try {
    // Count what *this* pipeline produced, not what is in the table: a seeded
    // database already holds 67 mock articles, so counting all of them would ask
    // a correctly-wired mock job for zero articles forever
    // (`plans/dev-content-seeding.md`, choose-n guard).
    const producedByThisSource = await getAllPostsAfterDateBySource(
      new Date(Date.now() - writingInterval),
      ports.text.contentSource,
    );
    const newArticlesNeeded: number = MINIMAL_NUM_DAILY_ARTICLES - producedByThisSource.length;
    if (newArticlesNeeded <= 0) {
      return;
    }

    // TODO: getting extra articles than needed but maybe unneeded...
    // TODO: make sure to not rewrite an article that was already selected => database of already rewrittern articles
    // The recency window scales with the schedule; otherwise a compressed run
    // finishes before any real news falls inside the last 24 hours and reports
    // "no recent news" on a database that is full of it.
    const recentNewsWindow = scaledInterval(RECENT_NEWS_ARTICLES_TIME_THRESHOLD);
    // Same origin as the pipeline: otherwise a mock run rewrites live news into a
    // mock article, which is a provenance lie about the text it inherited.
    const currentNews: NewsItem[] = await getAllNewsArticlesAfterDate(
      new Date(Date.now() - recentNewsWindow),
      ports.news.contentSource,
    );
    if (currentNews.length == 0) {
      console.error('No recent real news articles found!');
      return;
    }

    // TODO: this entire for loop looks like a hack
    for (let i = 0; i < newArticlesNeeded; i++) {
      if (currentNews.length === 0) {
        console.warn('Ran out of news articles to process');
        break;
      }
      const currentNewsItem = currentNews.splice(randomBelow(currentNews.length), 1)[0];
      const writer = await getRandomWriter(randomBelow, ports);
      await writeBlogPost(writer, currentNewsItem, true, ports);
    }
  } catch (error) {
    console.error('Error in generateScheduledArticles:', error);
    // Don't throw - allow the scheduler to continue running
  }
}
