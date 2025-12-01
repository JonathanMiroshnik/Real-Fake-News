import { Request, Response } from 'express';
import { getAllPosts } from '../lib/database/sqliteOperations.js';
import { deletePost } from '../lib/database/sqliteOperations.js';
import { blogDatabaseConfig } from '../lib/lowdb/databaseConfigurations.js';
import { ArticleScheme } from '../types/article.js';

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
