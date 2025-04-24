import { Request, Response } from 'express';
import { BlogResponse } from '../types/article';
export declare const TIME_BEFORE: number;
export declare const pullBlogs: (req: Request, res: Response) => Promise<void>;
export declare function getPostsAfterDate(afterDate: Date): Promise<BlogResponse>;
//# sourceMappingURL=blogController.d.ts.map