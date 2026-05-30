import { ONE_HOUR_MILLISECS, DAY_MILLISECS } from '../config/constants.js';
import { generateScheduledArticles } from './blogWriting.js';
import { addNewsToTotal } from './newsFetching.js';
import { generateScheduledRecipes } from './recipeGeneration.js';
import { selectDailyFeaturedArticle } from './featuredArticleSelection.js';
import { generateDailyHoroscopes } from './horoscopeGeneration.js';
import { debugLog } from '../utils/debugLogger.js';
import { registerJob } from './absoluteClock.js';

// Scheduler of recurring jobs in the backend.
// Uses the Absolute Clock engine for deterministic cron-driven scheduling.

// Used to start the recurring back-end jobs
export function initializeScheduledJobs() {
  // Check if scheduled jobs are enabled via environment variable
  const ENABLE_SCHEDULED_JOBS = process.env.ENABLE_SCHEDULED_JOBS === 'true';

  if (!ENABLE_SCHEDULED_JOBS) {
    debugLog('⏸️  Scheduled jobs are disabled (ENABLE_SCHEDULED_JOBS=false)');
    return;
  }

  const GENERATE_AI_ARTICLE_AVERAGE_TIME: number = ONE_HOUR_MILLISECS * 8;
  const NEWS_ARTICLES_TO_ADD: number = 10;

  // Run initial jobs immediately on boot
  addNewsToTotal(NEWS_ARTICLES_TO_ADD);
  generateScheduledArticles(GENERATE_AI_ARTICLE_AVERAGE_TIME);
  generateScheduledRecipes(DAY_MILLISECS);
  selectDailyFeaturedArticle();
  generateDailyHoroscopes();

  // Register all jobs with the Absolute Clock for ongoing scheduling
  registerJob({
    name: 'article-generation',
    description: 'Generates AI articles from recent news if below daily quota',
    cron: '0 */6 * * *',
    enabled: true,
    maxRetries: 1,
    timeoutMs: 300_000, // 5 minutes
    handler: async () => {
      await generateScheduledArticles(GENERATE_AI_ARTICLE_AVERAGE_TIME);
    },
  });

  registerJob({
    name: 'news-fetching',
    description: 'Fetches recent news articles from the NewsData API',
    cron: '0 */2 * * *',
    enabled: true,
    maxRetries: 1,
    timeoutMs: 120_000, // 2 minutes
    handler: async () => {
      await addNewsToTotal(NEWS_ARTICLES_TO_ADD);
    },
  });

  registerJob({
    name: 'recipe-generation',
    description: 'Generates new recipes if below daily quota',
    cron: '0 3 * * *',
    enabled: true,
    maxRetries: 1,
    timeoutMs: 300_000, // 5 minutes
    handler: async () => {
      await generateScheduledRecipes(DAY_MILLISECS);
    },
  });

  registerJob({
    name: 'featured-article-selection',
    description: 'Selects a random today article as featured (if none set)',
    cron: '0 0 * * *',
    enabled: true,
    maxRetries: 0,
    timeoutMs: 60_000, // 1 minute
    handler: async () => {
      await selectDailyFeaturedArticle();
    },
  });

  registerJob({
    name: 'horoscope-generation',
    description: 'Generates daily horoscopes',
    cron: '0 1 * * *',
    enabled: true,
    maxRetries: 1,
    timeoutMs: 120_000, // 2 minutes
    handler: async () => {
      await generateDailyHoroscopes();
    },
  });

  debugLog('✅ Absolute Clock initialized with 5 registered jobs');
}
