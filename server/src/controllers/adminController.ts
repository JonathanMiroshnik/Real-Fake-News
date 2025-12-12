import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getAllPosts, getPostByKey, updatePost, getPostsCount, getPostsPaginated } from '../lib/database/sqliteOperations.js';
import { deletePost } from '../lib/database/sqliteOperations.js';
import { blogDatabaseConfig } from '../lib/database/databaseConfigurations.js';
import { ArticleScheme } from '../types/article.js';
import { compressImageForWeb, getCompressedImagePath } from '../utils/imageCompression.js';
import { writeBlogPost } from '../services/blogService.js';
import { getRandomWriter } from '../services/writerService.js';
import { getAllNewsArticlesAfterDate, NewsItem } from '../services/newsService.js';
import { RECENT_NEWS_ARTICLES_TIME_THRESHOLD } from '../config/constants.js';
import { generateRecipe, getRandomFoods } from '../services/recipeService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple password validation (in production, use proper authentication)
function validatePassword(req: Request): boolean {
  const password = req.query.password as string;
  const expectedPassword = process.env.ADMIN_PASSWORD || 'changeme123';
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  
  // In development, also accept 'debug' for easier testing
  if (isDevelopment && password === 'debug') {
    return true;
  }
  
  return password === expectedPassword;
}

// In-memory storage for texts (in production, use database)
let texts: string[] = [];

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const imagesDir = path.join(__dirname, '../../data/images');
    fs.mkdirSync(imagesDir, { recursive: true });
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const ext = path.extname(file.originalname);
    const filename = `img-${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only image files are allowed.'));
    }
  }
});

// Export multer middleware for use in routes
export const uploadMiddleware = upload.single('image');

// Get all articles for admin panel (with optional pagination)
// Supports fetching multiple pages at once via pages parameter (comma-separated page numbers)
export const getAdminArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validatePassword(req)) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    // Check if pagination parameters are provided
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const itemsPerPage = req.query.itemsPerPage ? parseInt(req.query.itemsPerPage as string, 10) : undefined;
    const pages = req.query.pages ? (req.query.pages as string).split(',').map(p => parseInt(p.trim(), 10)).filter(p => !isNaN(p) && p > 0) : undefined;

    if (pages && pages.length > 0 && itemsPerPage !== undefined) {
      // Fetch multiple pages at once
      // Sort pages to ensure correct order in response
      const sortedPages = [...pages].sort((a, b) => a - b);
      const allArticles: ArticleScheme[] = [];
      for (const pageNum of sortedPages) {
        const pageArticles = await getPostsPaginated<ArticleScheme>(
          blogDatabaseConfig,
          pageNum,
          itemsPerPage,
          'timestamp',
          'DESC'
        );
        allArticles.push(...pageArticles);
      }
      
      res.json({
        success: true,
        articles: allArticles,
        error: ''
      });
    } else if (page !== undefined && itemsPerPage !== undefined) {
      // Single page request
      const articles: ArticleScheme[] = await getPostsPaginated<ArticleScheme>(
        blogDatabaseConfig,
        page,
        itemsPerPage,
        'timestamp',
        'DESC'
      );
      
      res.json({
        success: true,
        articles: articles,
        error: ''
      });
    } else {
      // Non-paginated request (backward compatibility)
      const allArticles: ArticleScheme[] = await getAllPosts<ArticleScheme>(blogDatabaseConfig);
      
      res.json({
        success: true,
        articles: allArticles,
        error: ''
      });
    }
  } catch (error) {
    console.error('Error fetching admin articles:', error);
    res.status(500).json({
      success: false,
      articles: [],
      error: 'Failed to fetch articles'
    });
  }
};

// Get total count of articles for admin panel
export const getAdminArticlesCount = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validatePassword(req)) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    const totalCount = await getPostsCount<ArticleScheme>(blogDatabaseConfig);
    
    res.json({
      success: true,
      totalCount: totalCount,
      error: ''
    });
  } catch (error) {
    console.error('Error fetching admin articles count:', error);
    res.status(500).json({
      success: false,
      totalCount: 0,
      error: 'Failed to fetch articles count'
    });
  }
};

// Get a single article by key
export const getAdminArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validatePassword(req)) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    const { key } = req.params;
    if (!key) {
      res.status(400).json({ error: 'Article key is required' });
      return;
    }

    const article = await getPostByKey<ArticleScheme>(key, blogDatabaseConfig);
    
    if (article) {
      res.json({
        success: true,
        article: article
      });
    } else {
      res.status(404).json({ error: 'Article not found' });
    }
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
};

// Update an article
export const updateAdminArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validatePassword(req)) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    const { key } = req.params;
    if (!key) {
      res.status(400).json({ error: 'Article key is required' });
      return;
    }

    // Get the existing article first
    const existingArticle = await getPostByKey<ArticleScheme>(key, blogDatabaseConfig);
    if (!existingArticle) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    // Update only the fields provided in the request body
    const updatedArticle: ArticleScheme = {
      ...existingArticle,
      ...(req.body.title !== undefined && { title: req.body.title }),
      ...(req.body.content !== undefined && { content: req.body.content }),
      ...(req.body.headImage !== undefined && { headImage: req.body.headImage }),
      ...(req.body.category !== undefined && { category: req.body.category }),
      ...(req.body.shortDescription !== undefined && { shortDescription: req.body.shortDescription }),
      ...(req.body.writerType !== undefined && { writerType: req.body.writerType }),
      ...(req.body.timestamp !== undefined && { timestamp: req.body.timestamp }),
    };

    const success = await updatePost<ArticleScheme>(updatedArticle, blogDatabaseConfig);
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Article updated successfully',
        article: updatedArticle
      });
    } else {
      res.status(500).json({ error: 'Failed to update article' });
    }
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
};

// Delete an article
export const deleteAdminArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validatePassword(req)) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    const { key } = req.params;
    if (!key) {
      res.status(400).json({ error: 'Article key is required' });
      return;
    }

    const deleted = await deletePost<ArticleScheme>(key, blogDatabaseConfig);
    
    if (deleted) {
      res.json({ success: true, message: 'Article deleted successfully' });
    } else {
      res.status(404).json({ error: 'Article not found' });
    }
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
};

// Get all texts
export const getAdminTexts = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validatePassword(req)) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    res.json({
      success: true,
      texts: texts
    });
  } catch (error) {
    console.error('Error fetching texts:', error);
    res.status(500).json({
      success: false,
      texts: [],
      error: 'Failed to fetch texts'
    });
  }
};

// Upload an image
export const uploadAdminImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validatePassword(req)) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Automatically compress the uploaded image for web use
    // Original is kept in the main images directory
    const originalPath = req.file.path;
    const compressedPath = getCompressedImagePath(req.file.filename);
    
    try {
      await compressImageForWeb(originalPath, compressedPath);
      console.log(`Compressed uploaded image: ${req.file.filename}`);
    } catch (compressError) {
      // Log error but don't fail the upload - original is still saved
      console.error('Error compressing uploaded image:', compressError);
    }

    // Return the filename so the frontend can use it
    res.json({
      success: true,
      filename: req.file.filename,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

// Add a text
export const addAdminText = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validatePassword(req)) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Text is required and must be a non-empty string' });
      return;
    }

    texts.push(text.trim());
    
    res.json({
      success: true,
      texts: texts
    });
  } catch (error) {
    console.error('Error adding text:', error);
    res.status(500).json({ error: 'Failed to add text' });
  }
};

// Generate a news article
export const generateAdminArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validatePassword(req)) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    console.log('📝 [generateAdminArticle] Admin requested article generation');

    // Get a random writer
    const writer = await getRandomWriter();
    console.log('📝 [generateAdminArticle] Selected writer:', writer.name);

    // Get a random news item from recent news
    const recentNews = await getAllNewsArticlesAfterDate(new Date(Date.now() - RECENT_NEWS_ARTICLES_TIME_THRESHOLD));
    
    if (recentNews.length === 0) {
      res.status(400).json({ 
        success: false,
        error: 'No recent news articles available. Please ensure news fetching is working.' 
      });
      return;
    }

    // Pick a random news item
    const randomIndex = Math.floor(Math.random() * recentNews.length);
    const newsItem: NewsItem = recentNews[randomIndex];
    console.log('📝 [generateAdminArticle] Selected news item:', newsItem.title);

    // Generate the article
    const article = await writeBlogPost(writer, newsItem, true);

    if (!article) {
      res.status(500).json({ 
        success: false,
        error: 'Failed to generate article. Check server logs for details.' 
      });
      return;
    }

    console.log('✅ [generateAdminArticle] Article generated successfully:', article.key);

    res.json({
      success: true,
      message: 'Article generated successfully',
      article: article
    });
  } catch (error) {
    console.error('❌ [generateAdminArticle] Error generating article:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate article' 
    });
  }
};

// Generate a recipe
export const generateAdminRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validatePassword(req)) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    console.log('🍳 [generateAdminRecipe] Admin requested recipe generation');

    // Get a random writer
    const writer = await getRandomWriter();
    console.log('🍳 [generateAdminRecipe] Selected writer:', writer.name);

    // Get random foods (2-3 foods)
    const numFoods = 2 + Math.floor(Math.random() * 2); // 2 or 3 foods
    const foods = await getRandomFoods(numFoods);
    
    if (foods.length === 0) {
      res.status(400).json({ 
        success: false,
        error: 'No foods available in database. Please add foods to the foods table.' 
      });
      return;
    }

    console.log('🍳 [generateAdminRecipe] Selected foods:', foods.join(', '));

    // Generate the recipe
    const recipe = await generateRecipe(writer, foods, true);

    if (!recipe) {
      res.status(500).json({ 
        success: false,
        error: 'Failed to generate recipe. Check server logs for details.' 
      });
      return;
    }

    console.log('✅ [generateAdminRecipe] Recipe generated successfully:', recipe.key);

    res.json({
      success: true,
      message: 'Recipe generated successfully',
      recipe: recipe
    });
  } catch (error) {
    console.error('❌ [generateAdminRecipe] Error generating recipe:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate recipe' 
    });
  }
};
