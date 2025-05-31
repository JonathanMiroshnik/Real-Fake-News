import { startRandomInterval } from "../utils/general.js";
import { ONE_HOUR_MILLISECS, MILLISECS_IN_SEC } from "../config/constants.js";
import { generateScheduledArticles } from "./blogWriting.js";
import { addNewsToTotal } from "./newsFetching.js";

// Scheduler of recurring jobs in the backend.
// Will contain all the activation functions of the recurring jobs, along with the timing(time to recur)

// Used to start the recurring back-end jobs
export function initializeScheduledJobs() {
    const GENERATE_AI_ARTICLE_AVERAGE_TIME: number = ONE_HOUR_MILLISECS * 8;
    const FETCH_RECENT_NEWS_ARTICLES_AVERAGE_TIME: number = ONE_HOUR_MILLISECS * 2;
    const NEWS_ARTICLES_TO_ADD: number = 10;

    addNewsToTotal(NEWS_ARTICLES_TO_ADD);
    generateScheduledArticles(GENERATE_AI_ARTICLE_AVERAGE_TIME);

    startRandomInterval(() => generateScheduledArticles(GENERATE_AI_ARTICLE_AVERAGE_TIME), 1, 2 * GENERATE_AI_ARTICLE_AVERAGE_TIME / MILLISECS_IN_SEC);
    startRandomInterval(() => addNewsToTotal(NEWS_ARTICLES_TO_ADD), 1, 2 * FETCH_RECENT_NEWS_ARTICLES_AVERAGE_TIME / MILLISECS_IN_SEC);
}
