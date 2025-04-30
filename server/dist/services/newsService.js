"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArticles = getArticles;
exports.resetArticles = resetArticles;
exports.addNewsToTotal = addNewsToTotal;
require("dotenv/config");
const axios_1 = __importDefault(require("axios"));
const node_cron_1 = __importDefault(require("node-cron"));
const BASE_URL = 'https://newsdata.io/api/1/news';
const DAILY_TOKENS = 200;
const NUM_OF_ARTICLES_PER_TOKEN = 10;
// TODO: like this, it will be restarted every time we start up the project again
var remainingTokens = DAILY_TOKENS;
var dailyArticles = [];
node_cron_1.default.schedule('0 0 * * *', () => {
    remainingTokens = DAILY_TOKENS;
    resetArticles();
    console.log('Daily tokens reset.');
});
function getArticles() {
    return dailyArticles;
}
function resetArticles() {
    dailyArticles = [];
}
// TODO: I want to get an arbitrary number of daily articles to use in any given moment.
async function addNewsToTotal(numArticles = 10) {
    // TODO: perhaps I could just check the number of tokens left by asking the API at some other URL?
    // If there are no more tokens remaining, this function cannot be used.
    if (remainingTokens <= 0) {
        throw new Error("No more tokens remaining.");
    }
    if (remainingTokens * NUM_OF_ARTICLES_PER_TOKEN < numArticles) {
        throw new Error(`Not enough tokens remaining for ${numArticles} articles.`);
    }
    let neededApiRequests = Math.ceil(numArticles / NUM_OF_ARTICLES_PER_TOKEN);
    let nextPage = "";
    for (let i = 0; i < neededApiRequests; i++) {
        nextPage = await fetchNews(nextPage);
        if (nextPage === "") {
            return false;
        }
    }
    return true;
}
/**
 * Performs one news API call and adds the articles to the total.
 *
 * @param {string} page - The page of the current news to pull from.
 * @returns {string} The next page in the current news page that we could pull from.
 */
async function fetchNews(page = "") {
    try {
        const response = await axios_1.default.get(BASE_URL, {
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
        const articles = response.data.results;
        for (const article of articles) {
            // console.log('ID:', article.article_id);
            // console.log('Title:', article.title);
            // console.log('Description:', article.description);
            // console.log('---');
            dailyArticles.push({ title: article.title, description: article.description });
        }
        remainingTokens--;
        return response.data.nextPage;
    }
    catch (error) {
        console.error('Failed to fetch news:', error);
        return "";
    }
}
//# sourceMappingURL=newsService.js.map