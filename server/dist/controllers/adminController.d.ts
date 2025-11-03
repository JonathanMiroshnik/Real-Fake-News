import { Request, Response, NextFunction } from 'express';
export declare const validateAdminPassword: (req: Request, res: Response, next: NextFunction) => void;
export declare const getAllArticles: (req: Request, res: Response) => Promise<void>;
export declare const deleteArticle: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllTexts: (req: Request, res: Response) => Promise<void>;
export declare const addText: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
