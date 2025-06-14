"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateScheduledArticles = generateScheduledArticles;
const crypto_1 = require("crypto");
const constants_js_1 = require("../config/constants.js");
const blogService_js_1 = require("../services/blogService.js");
const newsService_js_1 = require("../services/newsService.js");
const writerService_js_1 = require("../services/writerService.js");
// Responsible for the state machine of the blog writers
async function generateScheduledArticles(writingInterval) {
    const result = await (0, blogService_js_1.getAllPostsAfterDate)(new Date(Date.now() - writingInterval));
    let newArticlesNeeded = constants_js_1.MINIMAL_NUM_DAILY_ARTICLES - result.articles.length;
    // console.log("new articles needed:", newArticlesNeeded);
    if (newArticlesNeeded <= 0) {
        return;
    }
    // TODO: getting extra articles than needed but maybe unneeded...
    // TODO: make sure to not rewrite an article that was already selected => database of already rewrittern articles
    const currentNews = await (0, newsService_js_1.getAllNewsArticlesAfterDate)(new Date(Date.now() - constants_js_1.RECENT_NEWS_ARTICLES_TIME_THRESHOLD));
    if (currentNews.length == 0) {
        console.error("No recent real news articles found!");
        return;
    }
    for (let i = 0; i < newArticlesNeeded; i++) {
        let currentNewsItem = currentNews.splice((0, crypto_1.randomInt)(currentNews.length), 1)[0];
        await (0, blogService_js_1.writeBlogPost)(await (0, writerService_js_1.getRandomWriter)(), currentNewsItem);
    }
}
//# sourceMappingURL=blogWriting.js.map