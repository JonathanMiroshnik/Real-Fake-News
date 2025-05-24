import { Request, Response } from 'express';
import { BlogResponse } from '../types/article.js';
import { getAllPostsAfterDate } from '../services/blogService.js';
import { DAY_MILLISECS, ONE_HOUR_MILLISECS } from '../config/constants.js';

// TODO: some functions need to be combined here
// Currently set up to pull only the DAILY blog posts, the request does not matter
export const pullBlogs = async (req: Request, res: Response) => {
    console.log('Pulling blogs!');

    try {
        const result: BlogResponse = await getAllPostsAfterDate(new Date(Date.now() - DAY_MILLISECS));
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Analysis failed' });
    }
};

export async function pullHourlyBlogs(req: Request, res: Response) {
    console.log('Pulling hourly blogs!');

    try {
        const result: BlogResponse = await getAllPostsAfterDate(new Date(Date.now() - ONE_HOUR_MILLISECS));
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Analysis failed' });
    }
}

export async function pullBlogsByMinute(req: Request, res: Response) {
    try {
        const minutes: number = parseInt(req.query.minute as string, 10);
        if (isNaN(minutes)) {
            res.status(400).json({ error: 'Invalid minute value' });
            return;
        }

        const result: BlogResponse = await getAllPostsAfterDate(new Date(Date.now() - minutes * 60 * 1000));
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Analysis failed' });
    }
}