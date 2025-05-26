"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNewsToTotal = addNewsToTotal;
require("dotenv/config");
const axios_1 = __importDefault(require("axios"));
const node_cron_1 = __importDefault(require("node-cron"));
const constants_1 = require("../config/constants");
const llmService_js_1 = require("./llmService.js");
// TODO: like this, it will be restarted every time we start up the project again
var remainingTokens = constants_1.NEWS_API_DAILY_TOKENS;
node_cron_1.default.schedule('0 0 * * *', () => {
    remainingTokens = constants_1.NEWS_API_DAILY_TOKENS;
    console.log('Daily tokens reset.');
});
// TODO: I want to get an arbitrary number of daily articles to use in any given moment.
async function addNewsToTotal(numArticles = 10) {
    // TODO: perhaps I could just check the number of tokens left by asking the API at some other URL?
    // If there are no more tokens remaining, this function cannot be used.
    if (remainingTokens <= 0) {
        throw new Error("No more tokens remaining.");
    }
    if (remainingTokens * constants_1.NEWS_API_NUM_OF_ARTICLES_PER_TOKEN < numArticles) {
        throw new Error(`Not enough tokens remaining for ${numArticles} articles.`);
    }
    let neededApiRequests = Math.ceil(numArticles / constants_1.NEWS_API_NUM_OF_ARTICLES_PER_TOKEN);
    let nextPage = "";
    let retArticles = [];
    let gatherPage;
    for (let i = 0; i < neededApiRequests; i++) {
        [retArticles, gatherPage] = await fetchNews(nextPage);
        // console.log("ret articles", retArticles.length, "page", gatherPage);
        nextPage = gatherPage;
        if (nextPage === "") {
            return [];
        }
    }
    return retArticles;
}
/**
 * Performs one news API call and adds the articles to the total.
 *
 * @param {string} page - The page of the current news to pull from.
 * @returns {string} The next page in the current news page that we could pull from.
 */
async function fetchNews(page = "") {
    if (remainingTokens <= 0) {
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
        var retArticles = [];
        const articles = response.data.results;
        // console.log("cur articles:",articles.length);
        for (const article of articles) {
            // TODO: save API news article data to your own private data store for further uses
            // if (await createPost<ArticleScheme>(article, DB_NEWS_DATA_FILE)) {
            // dailyArticles.push({ title: article.title, description: article.description })
            // TODO: add topics filter list in .env or outside in general
            const questionPrompt = `
        Is the following article title and/or description related to the following topics?\n
        Topics: Israel, Gaza, IDF\n
        Article Title: ${article.title}\n
        Article Description: ${article.description}\n
      `;
            const boolResponse = await (0, llmService_js_1.getBooleanResponse)(questionPrompt);
            console.log("Is this related?", boolResponse);
            if (!boolResponse) {
                retArticles.push({ title: article.title, description: article.description });
            }
            // }        
        }
        remainingTokens--;
        return [[...retArticles], response.data.nextPage.toString()];
    }
    catch (error) {
        console.error('Failed to fetch news:', error);
        return [[], ""];
    }
}
//# sourceMappingURL=newsService.js.map