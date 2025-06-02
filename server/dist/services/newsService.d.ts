import 'dotenv/config';
/**
 * Number of remaining daily News API tokens
 */
export declare var remainingTokens: number;
export type NewsItem = {
    article_id: string;
    title: string;
    description: string;
    pubDate: string;
    pubDateTZ: string;
};
/**
 * Performs one news API call and adds the articles to the total.
 *
 * @param {string} page - The page of the current news to pull from.
 * @returns {string} The next page in the current news page that we could pull from.
 */
export declare function fetchNews(page?: string): Promise<[any[], nextPage: string]>;
/**
 * Used to get news articles after a given date
 * @param startDate Given date after which articles are returned
 * @returns News Items that were published after the given date
 */
export declare function getAllNewsArticlesAfterDate(startDate: Date): Promise<NewsItem[]>;
