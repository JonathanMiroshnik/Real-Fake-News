import 'dotenv/config';
import { BlogResponse } from '../types/article.js';
export declare function getAllPostsAfterDate(startDate: Date): Promise<BlogResponse>;
