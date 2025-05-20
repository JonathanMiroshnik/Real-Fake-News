import 'dotenv/config';
import { ArticleScheme, BlogResponse } from '../types/article.js';
export declare function getAllPostsAfterDate(startDate: Date): Promise<BlogResponse>;
import { Writer } from "../types/writer.js";
import { NewsItem } from "../services/newsService.js";
export declare function getPostsAfterDate(afterDate: Date): Promise<BlogResponse>;
export declare function writeBlogPost(writer: Writer, currentNewsItem?: NewsItem, saveArticle?: boolean): Promise<ArticleScheme | undefined>;
