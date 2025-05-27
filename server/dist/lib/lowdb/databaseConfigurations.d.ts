import { NewsItem } from "../../services/newsService.js";
import { ArticleScheme } from "../../types/article.js";
import { Writer } from '../../types/writer';
export interface DatabaseConfig<P> {
    source: string;
    exists: (pInput: P) => Promise<boolean>;
    find: (key: string) => Promise<P | undefined>;
    getKey: (pInput: P) => Promise<string>;
    copyValues: (fromInput: P, toInput: P) => boolean;
}
export declare const blogDatabaseConfig: DatabaseConfig<ArticleScheme>;
export declare const newsDatabaseConfig: DatabaseConfig<NewsItem>;
export declare const writerDatabaseConfig: DatabaseConfig<Writer>;
