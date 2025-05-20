import { randomInt } from "crypto";

import { MILLISECS_IN_SEC, ONE_HOUR_MILLISECS, TEN_MINUTES_MILLISECONDS, MINIMAL_NUM_DAILY_ARTICLES } from "../config/constants.js";
import { BlogResponse } from "../types/article.js";
import { getPostsAfterDate, writeBlogPost } from "../services/blogService.js";
import { NewsItem, addNewsToTotal } from "../services/newsService.js";
import { getRandomWriter } from "../services/writerService.js";

// Responsible for the state machine of the blog writers

async function generateScheduledArticles(writingInterval: number) {
    const result: BlogResponse = await getPostsAfterDate(new Date(Date.now() - writingInterval));
    let newArticlesNeeded: number = MINIMAL_NUM_DAILY_ARTICLES - result.articles.length;
    if (newArticlesNeeded <= 0) {
        return;
    }    

    // TODO: getting extra articles than needed but maybe unneeded...
    const currentNews: NewsItem[] = await addNewsToTotal(newArticlesNeeded * 2);

    if (currentNews.length == 0) {
        return;
    }
    
    for (let i = 0; i < newArticlesNeeded; i++) {
        let currentNewsItem = currentNews.splice(randomInt(currentNews.length), 1)[0];
        await writeBlogPost(await getRandomWriter(), currentNewsItem);
    }    
}

// TODO: not sure hwat checkInterval is here for
export function blogWritingManager(writingInterval: number = ONE_HOUR_MILLISECS, checkInterval: number = TEN_MINUTES_MILLISECONDS) {
    generateScheduledArticles(writingInterval);

    // The average time between article generations will be 1 hour
    startRandomInterval(() => generateScheduledArticles(writingInterval), 1, 2 * ONE_HOUR_MILLISECS / MILLISECS_IN_SEC);
}

function startRandomInterval(
    fn: () => void,
    minDelaySec: number,
    maxDelaySec: number
    ) {
    let lastExecution = Date.now();
    let intervals: number[] = [];

    function scheduleNext() {
        const delayMs =
        Math.floor(Math.random() * (maxDelaySec - minDelaySec + 1) + minDelaySec) * 1000;

        setTimeout(() => {
            const now = Date.now();
            const elapsed = (now - lastExecution) / 1000; // in seconds
            intervals.push(elapsed);
            lastExecution = now;

            // Call your function
            fn();

            // Log average interval
            const average =
            intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
            console.log(`Average interval: ${average.toFixed(2)}s`);

            // Schedule next call
            scheduleNext();
        }, delayMs);
    }

    // Start the first call
    scheduleNext();
}
