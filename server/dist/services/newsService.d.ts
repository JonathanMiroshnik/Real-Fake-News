import 'dotenv/config';
export type NewsItem = {
    title: string;
    description: string;
};
export declare function fetchNews(): Promise<NewsItem[] | undefined>;
//# sourceMappingURL=newsService.d.ts.map