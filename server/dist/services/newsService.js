"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remainingTokens = void 0;
exports.fetchNews = fetchNews;
exports.getAllNewsArticlesAfterDate = getAllNewsArticlesAfterDate;
require("dotenv/config");
const axios_1 = __importDefault(require("axios"));
const node_cron_1 = __importDefault(require("node-cron"));
const constants_1 = require("../config/constants");
const lowdbOperations_1 = require("../lib/lowdb/lowdbOperations");
const databaseConfigurations_1 = require("../lib/lowdb/databaseConfigurations");
const timeService_1 = require("./timeService");
// TODO: like this, it will be restarted every time we start up the project again
/**
 * Number of remaining daily News API tokens
 */
exports.remainingTokens = constants_1.NEWS_API_DAILY_TOKENS;
// Every day at midnight
node_cron_1.default.schedule('0 0 * * *', () => {
    exports.remainingTokens = constants_1.NEWS_API_DAILY_TOKENS;
    console.log('Daily tokens reset.');
});
/**
 * Performs one news API call and adds the articles to the total.
 *
 * @param {string} page - The page of the current news to pull from.
 * @returns {string} The next page in the current news page that we could pull from.
 */
async function fetchNews(page = "") {
    if (exports.remainingTokens <= 0) {
        throw new Error("No more tokens remaining to do another API call.");
    }
    try {
        const response = await axios_1.default.get(constants_1.NEWS_API_BASE_URL, {
            params: {
                apikey: process.env.NEWSDATA_API_KEY,
                // country: 'us',       // Optional filter: only US news
                language: 'en', // Optional: only English news
                category: 'top', // Optional: top news category
            }
        });
        if (page !== "") {
            response.config.params.page = page;
        }
        exports.remainingTokens--;
        return [[...response.data.results], response.data.nextPage.toString()];
    }
    catch (error) {
        console.error('Failed to fetch news:', error);
        return [[], ""];
    }
}
/**
 * Used to get news articles after a given date
 * @param startDate Given date after which articles are returned
 * @returns News Items that were published after the given date
 */
async function getAllNewsArticlesAfterDate(startDate) {
    const allArticles = await (0, lowdbOperations_1.getAllPosts)(databaseConfigurations_1.newsDatabaseConfig);
    const retArticles = allArticles.filter(article => {
        const timestamp = (0, timeService_1.standardizeDate)(article.pubDate, article.pubDateTZ);
        try {
            const articleDate = new Date(timestamp);
            const startTime = startDate.getTime();
            return articleDate.getTime() > startTime;
        }
        catch (e) {
            console.error('Invalid date format:', timestamp);
            return false;
        }
    });
    return retArticles;
}
//# sourceMappingURL=newsService.js.map