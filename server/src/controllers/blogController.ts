import { Request, Response } from 'express';
import { BlogResponse } from '../types/article.js';
import { getAllPostsAfterDate, getRelevantArticles } from '../services/blogService.js';
import { getPostByKey } from '../lib/database/sqliteOperations.js';
import { blogDatabaseConfig } from '../lib/database/databaseConfigurations.js';
import { ArticleScheme } from '../types/article.js';
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
    console.log('📥 Received request to /api/blogs/by-minute');
    console.log('📥 Query params:', req.query);
    console.log('📥 Headers:', req.headers);
    
    try {
        const minutes: number = parseInt(req.query.minute as string, 10);
        console.log('📥 Parsed minutes:', minutes);
        
        if (isNaN(minutes)) {
            console.error('❌ Invalid minute value:', req.query.minute);
            res.status(400).json({ error: 'Invalid minute value' });
            return;
        }

        const startDate = new Date(Date.now() - minutes * 60 * 1000);
        console.log('📥 Fetching articles after date:', startDate.toISOString());
        
        const result: BlogResponse = await getAllPostsAfterDate(startDate);
        console.log('📥 Found', result.articles.length, 'articles');
        
        res.json(result);
    } catch (error) {
        console.error('❌ Error in pullBlogsByMinute:', error);
        res.status(500).json({ error: 'Analysis failed' });
    }
}

export async function getRelevantArticlesController(req: Request, res: Response) {
    console.log('📥 Received request to /api/blogs/relevant');
    
    try {
        const result: BlogResponse = await getRelevantArticles();
        console.log('📥 Returning', result.articles.length, 'relevant articles');
        
        res.json(result);
    } catch (error) {
        console.error('❌ Error in getRelevantArticlesController:', error);
        res.status(500).json({ error: 'Failed to fetch relevant articles' });
    }
}

export async function getArticleByKeyController(req: Request, res: Response) {
    const { key } = req.params;
    console.log('📥 Received request to /api/blogs/:key for key:', key);
    
    if (!key) {
        res.status(400).json({ error: 'Article key is required' });
        return;
    }
    
    try {
        const article = await getPostByKey<ArticleScheme>(key, blogDatabaseConfig);
        
        if (article) {
            console.log('📥 Returning article:', article.key, article.title);
            res.json({
                success: true,
                article: article
            });
        } else {
            console.log('📥 Article not found for key:', key);
            res.status(404).json({ 
                success: false,
                error: 'Article not found' 
            });
        }
    } catch (error) {
        console.error('❌ Error in getArticleByKeyController:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch article' 
        });
    }
}