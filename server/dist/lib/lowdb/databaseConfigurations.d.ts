import { ArticleScheme } from "../../types/article.js";
export interface DatabaseConfig<P> {
    source: string;
    exists: (pInput: P) => Promise<boolean>;
    find: (key: string) => Promise<P | null | undefined>;
}
export declare const blogDatabaseConfig: DatabaseConfig<ArticleScheme>;
