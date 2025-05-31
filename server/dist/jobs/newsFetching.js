"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNewsToTotal = addNewsToTotal;
const constants_1 = require("../config/constants");
const lowdbOperations_1 = require("../lib/lowdb/lowdbOperations");
const databaseConfigurations_1 = require("../lib/lowdb/databaseConfigurations");
const newsService_1 = require("../services/newsService");
// TODO: I want to get an arbitrary number of daily articles to use in any given moment.
async function addNewsToTotal(numArticles = 10) {
    // TODO: perhaps I could just check the number of tokens left by asking the API at some other URL?
    // If there are no more tokens remaining, this function cannot be used.
    if (newsService_1.remainingTokens <= 0) {
        throw new Error("No more tokens remaining.");
    }
    if (newsService_1.remainingTokens * constants_1.NEWS_API_NUM_OF_ARTICLES_PER_TOKEN < numArticles) {
        throw new Error(`Not enough tokens remaining for ${numArticles} articles.`);
    }
    let neededApiRequests = Math.ceil(numArticles / constants_1.NEWS_API_NUM_OF_ARTICLES_PER_TOKEN);
    let nextPage = "";
    let retArticles = [];
    let gatherPage;
    for (let i = 0; i < neededApiRequests; i++) {
        [retArticles, gatherPage] = await (0, newsService_1.fetchNews)(nextPage);
        // console.log(`Fetched ${retArticles.length} recent real news articles`);
        insertArticlesToDatabase(retArticles);
        nextPage = gatherPage;
        if (nextPage === "") {
            return [];
        }
    }
    return retArticles;
}
async function insertArticlesToDatabase(articles) {
    var retArticles = [];
    for (const article of articles) {
        // TODO: add topics filter list in .env or outside in general
        const questionPrompt = `
        Is the following article title and/or description related to the following topics?\n
        Topics: Israel, Gaza, IDF\n
        Article Title: ${article.title}\n
        Article Description: ${article.description}\n
        `;
        // TODO: perhaps 10 articles at once and remove the ones that dont work out and basically return a 10 long json boolean check? 
        // const boolResponse: boolean = await getBooleanResponse(questionPrompt);
        // console.log("Is this related?", boolResponse);
        // if (!boolResponse) {
        if (await (0, lowdbOperations_1.createPost)(article, databaseConfigurations_1.newsDatabaseConfig)) {
            retArticles.push({
                article_id: article.article_id,
                title: article.title,
                description: article.description,
                pubDate: article.pubDate,
                pubDateTZ: article.pubDateTZ
            });
        }
    }
    return retArticles;
}
//# sourceMappingURL=newsFetching.js.map