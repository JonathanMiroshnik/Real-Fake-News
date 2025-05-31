import { randomInt } from "crypto";
import { startRandomInterval } from "../utils/general.js";
import { MILLISECS_IN_SEC, ONE_HOUR_MILLISECS, TEN_MINUTES_MILLISECONDS, MINIMAL_NUM_DAILY_ARTICLES } from "../config/constants.js";
import { BlogResponse } from "../types/article.js";
import { getAllPostsAfterDate, writeBlogPost } from "../services/blogService.js";
import { NewsItem } from "../services/newsService.js";
import { getRandomWriter } from "../services/writerService.js";

// Responsible for the state machine of the blog writers

async function generateScheduledArticles(writingInterval: number) {
    const result: BlogResponse = await getAllPostsAfterDate(new Date(Date.now() - writingInterval));
    let newArticlesNeeded: number = MINIMAL_NUM_DAILY_ARTICLES - result.articles.length;
    // console.log("new articles needed:", newArticlesNeeded);
    if (newArticlesNeeded <= 0) {
        return;
    }    

    // TODO: getting extra articles than needed but maybe unneeded...
    const currentNews: NewsItem[] = await addNewsToTotal(newArticlesNeeded * 2);
    // console.log("current News:", currentNews.length);
    if (currentNews.length == 0) {
        return;
    }
    
    for (let i = 0; i < newArticlesNeeded; i++) {
        let currentNewsItem = currentNews.splice(randomInt(currentNews.length), 1)[0];
        await writeBlogPost(await getRandomWriter(), currentNewsItem);
    }    
}

export function blogWritingManager(averageWritingInterval: number = ONE_HOUR_MILLISECS) {
    generateScheduledArticles(averageWritingInterval);

    // The average time between article generations will be averageWritingInterval hours
    startRandomInterval(() => generateScheduledArticles(averageWritingInterval), 1, 2 * averageWritingInterval / MILLISECS_IN_SEC);
}