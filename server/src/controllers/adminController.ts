import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getAllPosts, getPostByKey, updatePost } from '../lib/database/sqliteOperations.js';
import { deletePost } from '../lib/database/sqliteOperations.js';
import { blogDatabaseConfig } from '../lib/lowdb/databaseConfigurations.js';
import { ArticleScheme } from '../types/article.js';

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

// Get all articles for admin panel
export const getAdminArticles = async (req: Request, res: Response) => {
  try {
    if (!validatePassword(req)) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const allArticles: ArticleScheme[] = await getAllPosts<ArticleScheme>(blogDatabaseConfig);
    
    res.json({
      success: true,
      articles: allArticles,
      error: ''
    });
  } catch (error) {
    console.error('Error fetching admin articles:', error);
    res.status(500).json({
      success: false,
      articles: [],
      error: 'Failed to fetch articles'
    });
  }
};

// Get a single article by key
export const getAdminArticle = async (req: Request, res: Response) => {
  try {
    if (!validatePassword(req)) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const { key } = req.params;
    if (!key) {
      return res.status(400).json({ error: 'Article key is required' });
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
export const updateAdminArticle = async (req: Request, res: Response) => {
  try {
    if (!validatePassword(req)) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const { key } = req.params;
    if (!key) {
      return res.status(400).json({ error: 'Article key is required' });
    }

    // Get the existing article first
    const existingArticle = await getPostByKey<ArticleScheme>(key, blogDatabaseConfig);
    if (!existingArticle) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Update only the fields provided in the request body
    const updatedArticle: ArticleScheme = {
      ...existingArticle,
      ...(req.body.title !== undefined && { title: req.body.title }),
      ...(req.body.content !== undefined && { content: req.body.content }),
      ...(req.body.headImage !== undefined && { headImage: req.body.headImage }),
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
export const deleteAdminArticle = async (req: Request, res: Response) => {
  try {
    if (!validatePassword(req)) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const { key } = req.params;
    if (!key) {
      return res.status(400).json({ error: 'Article key is required' });
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
export const getAdminTexts = async (req: Request, res: Response) => {
  try {
    if (!validatePassword(req)) {
      return res.status(401).json({ error: 'Invalid password' });
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
export const uploadAdminImage = async (req: Request, res: Response) => {
  try {
    if (!validatePassword(req)) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
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
export const addAdminText = async (req: Request, res: Response) => {
  try {
    if (!validatePassword(req)) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required and must be a non-empty string' });
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
