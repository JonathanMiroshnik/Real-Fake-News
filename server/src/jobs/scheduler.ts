import { startRandomInterval } from '../utils/general.js';
import { ONE_HOUR_MILLISECS, MILLISECS_IN_SEC, DAY_MILLISECS } from '../config/constants.js';
import { generateScheduledArticles } from './blogWriting.js';
import { addNewsToTotal } from './newsFetching.js';
import { generateScheduledRecipes } from './recipeGeneration.js';
import { scheduleFeaturedArticleSelection } from './featuredArticleSelection.js';
import { debugLog } from '../utils/debugLogger.js';

// Scheduler of recurring jobs in the backend.
// Will contain all the activation functions of the recurring jobs, along with the timing(time to recur)

// Used to start the recurring back-end jobs

// TODO: 11 November 2026 - This whole file and initializeScheduledJobs below are done wrong. 
// Instead of having these having these hard-coded numbers and timings, there should be
// some sort of admin-panel page and a config SQL table which contains the columns:
// ID, Name, TimingValue(or some other name for something like that) - use whatever is common for CRON jobs instead of the value
// Often what is common is the star * or 0 and then various numbers that define in what frequency the action takes place, then there needs to be
// some sort of addition to add random variation to that, maybe another value(in seconds? milliseconds?) to be added to the table.
// There is definitely best practice for something like this... 
export function initializeScheduledJobs() {
  // Check if scheduled jobs are enabled via environment variable
  const ENABLE_SCHEDULED_JOBS = process.env.ENABLE_SCHEDULED_JOBS === 'true';

  if (!ENABLE_SCHEDULED_JOBS) {
    debugLog('⏸️  Scheduled jobs are disabled (ENABLE_SCHEDULED_JOBS=false)');
    return;
  }

  const GENERATE_AI_ARTICLE_AVERAGE_TIME: number = ONE_HOUR_MILLISECS * 8;
  const FETCH_RECENT_NEWS_ARTICLES_AVERAGE_TIME: number = ONE_HOUR_MILLISECS * 2;
  const GENERATE_RECIPE_AVERAGE_TIME: number = DAY_MILLISECS;
  const NEWS_ARTICLES_TO_ADD: number = 10;

  addNewsToTotal(NEWS_ARTICLES_TO_ADD);
  generateScheduledArticles(GENERATE_AI_ARTICLE_AVERAGE_TIME);
  generateScheduledRecipes(GENERATE_RECIPE_AVERAGE_TIME);
  scheduleFeaturedArticleSelection();

  startRandomInterval(
    () => generateScheduledArticles(GENERATE_AI_ARTICLE_AVERAGE_TIME),
    1,
    (2 * GENERATE_AI_ARTICLE_AVERAGE_TIME) / MILLISECS_IN_SEC,
  );
  startRandomInterval(
    () => addNewsToTotal(NEWS_ARTICLES_TO_ADD),
    1,
    (2 * FETCH_RECENT_NEWS_ARTICLES_AVERAGE_TIME) / MILLISECS_IN_SEC,
  );
  startRandomInterval(
    () => generateScheduledRecipes(GENERATE_RECIPE_AVERAGE_TIME),
    1,
    (2 * GENERATE_RECIPE_AVERAGE_TIME) / MILLISECS_IN_SEC,
  );
}
