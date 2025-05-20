import 'dotenv/config';
export type NewsItem = {
    title: string;
    description: string;
};
export declare function addNewsToTotal(numArticles?: number): Promise<NewsItem[]>;
