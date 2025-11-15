import { randomInt } from "crypto";
import { MINIMAL_NUM_DAILY_ARTICLES, RECENT_NEWS_ARTICLES_TIME_THRESHOLD } from "../config/constants.js";
import { BlogResponse } from "../types/article.js";
import { getAllPostsAfterDate, writeBlogPost } from "../services/blogService.js";
import { getAllNewsArticlesAfterDate } from "../services/newsService.js";
import { NewsItem } from "../services/newsService.js";
import { getRandomWriter } from "../services/writerService.js";
import { ONE_HOUR_MILLISECS } from "../config/constants.js";

// Responsible for the state machine of the blog writers

export async function generateScheduledArticles(writingInterval: number) {
    const result: BlogResponse = await getAllPostsAfterDate(new Date(Date.now() - writingInterval));
    let newArticlesNeeded: number = MINIMAL_NUM_DAILY_ARTICLES - result.articles.length;
    // console.log("new articles needed:", newArticlesNeeded);
    if (newArticlesNeeded <= 0) {
        return;
    }    

    // TODO: getting extra articles than needed but maybe unneeded...
    // TODO: make sure to not rewrite an article that was already selected => database of already rewrittern articles
    const currentNews: NewsItem[] = await getAllNewsArticlesAfterDate(new Date(Date.now() - RECENT_NEWS_ARTICLES_TIME_THRESHOLD));
    if (currentNews.length == 0) {
        console.error("No recent real news articles found!");
        return;
    }
    
    for (let i = 0; i < newArticlesNeeded; i++) {
        try {
            let currentNewsItem = currentNews.splice(randomInt(currentNews.length), 1)[0];
            const writer = await getRandomWriter();
            await writeBlogPost(writer, currentNewsItem);
        } catch (error) {
            console.error(`Failed to generate article ${i + 1}/${newArticlesNeeded}:`, error instanceof Error ? error.message : error);
            // Continue to next iteration even if one fails
        }
    }    
}