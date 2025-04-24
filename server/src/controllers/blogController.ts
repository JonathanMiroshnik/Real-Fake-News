import { Request, Response } from 'express';
import { BlogRequest, BlogResponse } from '../types/article';
import { getAllPostsAfterDate } from '../services/blogService';


// Calculated in milliseconds
export const TIME_BEFORE = 24 * 60 * 60 * 1000;

// Currently set up to pull only the DAILY blog posts, the request does not matter
export const pullBlogs = async (req: Request, res: Response) => {
    console.log('Pulling blogs!');

    try {
        const result: BlogResponse = await getPostsAfterDate(new Date(Date.now() - TIME_BEFORE));
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Analysis failed' });
    }
};

// TODO: too small a function but useful in other places.
export async function getPostsAfterDate(afterDate: Date): Promise<BlogResponse> {
    const request: BlogRequest = {
        writer: "",
        afterDate: afterDate
    };
    
    const result: BlogResponse = await getAllPostsAfterDate(request.afterDate);
    return result;
}