import { Request, Response } from 'express';
export declare const pullBlogs: (req: Request, res: Response) => Promise<void>;
export declare function pullHourlyBlogs(req: Request, res: Response): Promise<void>;
export declare function pullBlogsByMinute(req: Request, res: Response): Promise<void>;
