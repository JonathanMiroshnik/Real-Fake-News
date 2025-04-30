import 'dotenv/config';
export type NewsItem = {
    title: string;
    description: string;
};
export declare function getArticles(): NewsItem[];
export declare function resetArticles(): void;
export declare function addNewsToTotal(numArticles?: number): Promise<boolean>;
//# sourceMappingURL=newsService.d.ts.map