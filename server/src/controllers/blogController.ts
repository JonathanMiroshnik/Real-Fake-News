import { Request, Response } from 'express';
import { BlogResponse } from '../types/article.js';
import {
  getAllPostsAfterDate,
  getRelevantArticles,
  getFeaturedArticleForDate,
} from '../services/blogService.js';
import { findOne } from '../lib/database/sqliteOperations.js';
import { blogDatabaseConfig } from '../lib/database/databaseConfigurations.js';
import { ArticleScheme } from '../types/article.js';
import { debugLog, debugError } from '../utils/debugLogger.js';

// [x] TODO: some functions need to be combined here
// Satisfied by taking the window as an argument: `/daily` and `/hourly` are now one handler mounted
// twice (`pullBlogs(DAY_MILLISECS)` / `pullBlogs(ONE_HOUR_MILLISECS)` in `routes/blogRoutes.ts`).
// The `by-minute`, `relevant` and `featured` handlers below read different data and stay separate.
export const pullBlogs = (windowMs: number) => async (req: Request, res: Response) => {
  debugLog('Pulling blogs!');

  try {
    const result: BlogResponse = await getAllPostsAfterDate(new Date(Date.now() - windowMs));

    res.json(result);
  } catch (error) {
    debugError('❌ Analysis failed:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
};

export async function pullBlogsByMinute(req: Request, res: Response) {
  debugLog('📥 Received request to /api/blogs/by-minute');
  debugLog('📥 Query params:', req.query);
  debugLog('📥 Headers:', req.headers);

  try {
    const minutes: number = parseInt(req.query.minute as string, 10);
    debugLog('📥 Parsed minutes:', minutes);

    if (isNaN(minutes)) {
      console.error('❌ Invalid minute value:', req.query.minute);
      res.status(400).json({ error: 'Invalid minute value' });
      return;
    }

    const startDate = new Date(Date.now() - minutes * 60 * 1000);
    debugLog('📥 Fetching articles after date:', startDate.toISOString());

    const result: BlogResponse = await getAllPostsAfterDate(startDate);
    debugLog('📥 Found', result.articles.length, 'articles');

    res.json(result);
  } catch (error) {
    console.error('❌ Error in pullBlogsByMinute:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
}

export async function getRelevantArticlesController(req: Request, res: Response) {
  debugLog('📥 Received request to /api/blogs/relevant');

  try {
    const result: BlogResponse = await getRelevantArticles();
    debugLog('📥 Returning', result.articles.length, 'relevant articles');

    res.json(result);
  } catch (error) {
    console.error('❌ Error in getRelevantArticlesController:', error);
    res.status(500).json({ error: 'Failed to fetch relevant articles' });
  }
}

export async function getArticleByKeyController(req: Request, res: Response) {
  const { key } = req.params;
  debugLog('📥 Received request to /api/blogs/:key for key:', key);

  if (!key) {
    res.status(400).json({ error: 'Article key is required' });
    return;
  }

  try {
    const article = await findOne<ArticleScheme>(blogDatabaseConfig, key);

    if (article) {
      debugLog('📥 Returning article:', article.key, article.title);
      res.json({
        success: true,
        article: article,
      });
    } else {
      // An empty database is not an error: `GET` of a key that is not there is a
      // 404, and inventing an article for it would hide an unseeded deployment.
      debugLog('📥 Article not found for key:', key);
      res.status(404).json({
        success: false,
        error: 'Article not found',
      });
    }
  } catch (error) {
    console.error('❌ Error in getArticleByKeyController:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch article',
    });
  }
}

export async function getFeaturedArticleController(req: Request, res: Response) {
  debugLog('📥 Received request to /api/blogs/featured');

  try {
    const date = req.query.date as string | undefined;
    const article = await getFeaturedArticleForDate(date);

    if (article) {
      debugLog('📥 Returning featured article:', article.key, article.title);
      res.json({
        success: true,
        article: article,
      });
    } else {
      debugLog('📥 No featured article found');
      res.json({
        success: false,
        article: null,
        message: 'No featured article found for the specified date',
      });
    }
  } catch (error) {
    console.error('❌ Error in getFeaturedArticleController:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured article',
    });
  }
}
