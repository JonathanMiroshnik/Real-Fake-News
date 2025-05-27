import 'dotenv/config';
export type NewsItem = {
    article_id: string;
    title: string;
    description: string;
};
export declare function addNewsToTotal(numArticles?: number): Promise<NewsItem[]>;
