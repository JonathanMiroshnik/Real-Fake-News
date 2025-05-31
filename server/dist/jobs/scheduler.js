"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeScheduledJobs = initializeScheduledJobs;
const general_js_1 = require("../utils/general.js");
const constants_js_1 = require("../config/constants.js");
const blogWriting_js_1 = require("./blogWriting.js");
const newsFetching_js_1 = require("./newsFetching.js");
// Scheduler of recurring jobs in the backend.
// Will contain all the activation functions of the recurring jobs, along with the timing(time to recur)
// Used to start the recurring back-end jobs
function initializeScheduledJobs() {
    const GENERATE_AI_ARTICLE_AVERAGE_TIME = constants_js_1.ONE_HOUR_MILLISECS * 8;
    const FETCH_RECENT_NEWS_ARTICLES_AVERAGE_TIME = constants_js_1.ONE_HOUR_MILLISECS * 2;
    const NEWS_ARTICLES_TO_ADD = 10;
    (0, newsFetching_js_1.addNewsToTotal)(NEWS_ARTICLES_TO_ADD);
    (0, blogWriting_js_1.generateScheduledArticles)(GENERATE_AI_ARTICLE_AVERAGE_TIME);
    (0, general_js_1.startRandomInterval)(() => (0, blogWriting_js_1.generateScheduledArticles)(GENERATE_AI_ARTICLE_AVERAGE_TIME), 1, 2 * GENERATE_AI_ARTICLE_AVERAGE_TIME / constants_js_1.MILLISECS_IN_SEC);
    (0, general_js_1.startRandomInterval)(() => (0, newsFetching_js_1.addNewsToTotal)(NEWS_ARTICLES_TO_ADD), 1, 2 * FETCH_RECENT_NEWS_ARTICLES_AVERAGE_TIME / constants_js_1.MILLISECS_IN_SEC);
}
//# sourceMappingURL=scheduler.js.map