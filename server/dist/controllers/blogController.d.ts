import { Request, Response } from 'express';
import { BlogResponse } from '../types/article';
export declare const DAY_MILLISECS: number;
export declare const ONE_HOUR_MILLISECS: number;
export declare const pullBlogs: (req: Request, res: Response) => Promise<void>;
export declare function getPostsAfterDate(afterDate: Date): Promise<BlogResponse>;
export declare function pullHourlyBlogs(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=blogController.d.ts.map