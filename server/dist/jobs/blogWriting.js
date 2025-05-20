"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogWritingManager = blogWritingManager;
const crypto_1 = require("crypto");
const constants_js_1 = require("../config/constants.js");
const blogService_js_1 = require("../services/blogService.js");
const newsService_js_1 = require("../services/newsService.js");
const writerService_js_1 = require("../services/writerService.js");
// Responsible for the state machine of the blog writers
async function generateScheduledArticles(writingInterval) {
    const result = await (0, blogService_js_1.getPostsAfterDate)(new Date(Date.now() - writingInterval));
    let newArticlesNeeded = constants_js_1.MINIMAL_NUM_DAILY_ARTICLES - result.articles.length;
    if (newArticlesNeeded <= 0) {
        return;
    }
    // TODO: getting extra articles than needed but maybe unneeded...
    const currentNews = await (0, newsService_js_1.addNewsToTotal)(newArticlesNeeded * 2);
    if (currentNews.length == 0) {
        return;
    }
    console.log("new", currentNews.length.toString());
    for (let i = 0; i < newArticlesNeeded; i++) {
        let currentNewsItem = currentNews.splice((0, crypto_1.randomInt)(currentNews.length), 1)[0];
        await (0, blogService_js_1.writeBlogPost)(await (0, writerService_js_1.getRandomWriter)(), currentNewsItem);
    }
}
// TODO: not sure hwat checkInterval is here for
function blogWritingManager(writingInterval = constants_js_1.ONE_HOUR_MILLISECS, checkInterval = constants_js_1.TEN_MINUTES_MILLISECONDS) {
    generateScheduledArticles(writingInterval);
    // The average time between article generations will be 1 hour
    startRandomInterval(() => generateScheduledArticles(writingInterval), 1, 2 * constants_js_1.ONE_HOUR_MILLISECS / constants_js_1.MILLISECS_IN_SEC);
}
function startRandomInterval(fn, minDelaySec, maxDelaySec) {
    let lastExecution = Date.now();
    let intervals = [];
    function scheduleNext() {
        const delayMs = Math.floor(Math.random() * (maxDelaySec - minDelaySec + 1) + minDelaySec) * 1000;
        setTimeout(() => {
            const now = Date.now();
            const elapsed = (now - lastExecution) / 1000; // in seconds
            intervals.push(elapsed);
            lastExecution = now;
            // Call your function
            fn();
            // Log average interval
            const average = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
            console.log(`Average interval: ${average.toFixed(2)}s`);
            // Schedule next call
            scheduleNext();
        }, delayMs);
    }
    // Start the first call
    scheduleNext();
}
//# sourceMappingURL=blogWriting.js.map