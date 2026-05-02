import { Request, Response } from 'express';
import { BlogResponse } from '../types/article.js';
import {
  getAllPostsAfterDate,
  getRelevantArticles,
  getFeaturedArticleForDate,
} from '../services/blogService.js';
import { getPostByKey, getPostsCount } from '../lib/database/sqliteOperations.js';
import { blogDatabaseConfig } from '../lib/database/databaseConfigurations.js';
import { ArticleScheme } from '../types/article.js';
import { DAY_MILLISECS, ONE_HOUR_MILLISECS } from '../config/constants.js';
import { debugLog } from '../utils/debugLogger.js';
import {
  isFakeDataEnabled,
  generateFakeArticle,
  generateFakeFeaturedArticle,
  getFakeBlogResponse,
} from '../services/fakeDataService.js';

// TODO: some functions need to be combined here
// Currently set up to pull only the DAILY blog posts, the request does not matter
export const pullBlogs = async (req: Request, res: Response) => {
  debugLog('Pulling blogs!');

  try {
    const result: BlogResponse = await getAllPostsAfterDate(new Date(Date.now() - DAY_MILLISECS));

    if (result.articles.length === 0 && isFakeDataEnabled()) {
      debugLog('📰 [Fallback] No daily articles found, generating fake articles');
      const fakeResponse = await getFakeBlogResponse(8);
      res.json(fakeResponse);
      return;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' });
  }
};

export async function pullHourlyBlogs(req: Request, res: Response) {
  debugLog('Pulling hourly blogs!');

  try {
    const result: BlogResponse = await getAllPostsAfterDate(
      new Date(Date.now() - ONE_HOUR_MILLISECS),
    );

    if (result.articles.length === 0 && isFakeDataEnabled()) {
      debugLog('📰 [Fallback] No hourly articles found, generating fake articles');
      const fakeResponse = await getFakeBlogResponse(8);
      res.json(fakeResponse);
      return;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' });
  }
}

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

    if (result.articles.length === 0 && isFakeDataEnabled()) {
      debugLog(
        '📰 [Fallback] No articles found in last',
        minutes,
        'minutes, generating fake articles',
      );
      const fakeResponse = await getFakeBlogResponse(8);
      res.json(fakeResponse);
      return;
    }

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

    // Fallback: if no articles found and fake data is enabled, return generated articles
    if (result.articles.length === 0 && isFakeDataEnabled()) {
      debugLog('📰 [Fallback] No articles found, generating fake articles');
      const fakeResponse = await getFakeBlogResponse(8);
      res.json(fakeResponse);
      return;
    }

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
    const article = await getPostByKey<ArticleScheme>(key, blogDatabaseConfig);

    if (article) {
      debugLog('📥 Returning article:', article.key, article.title);
      res.json({
        success: true,
        article: article,
      });
    } else if (isFakeDataEnabled()) {
      // Fallback: check if DB is empty, if so return a fake article
      const totalCount = await getPostsCount(blogDatabaseConfig);
      if (totalCount === 0) {
        debugLog('📰 [Fallback] Database empty, returning fake article for key:', key);
        const fakeArticle = await generateFakeArticle();
        // Preserve the requested key so the frontend can match it
        fakeArticle.key = key;
        res.json({
          success: true,
          article: fakeArticle,
          message: 'Auto-generated article (fallback - database was empty)',
        });
      } else {
        debugLog('📥 Article not found for key:', key);
        res.status(404).json({
          success: false,
          error: 'Article not found',
        });
      }
    } else {
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
    } else if (isFakeDataEnabled()) {
      // Fallback: no featured article found, generate a fake one
      debugLog('📰 [Fallback] No featured article found, generating fake featured article');
      const fakeArticle = await generateFakeFeaturedArticle();
      res.json({
        success: true,
        article: fakeArticle,
        message: 'Auto-generated featured article (fallback)',
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
