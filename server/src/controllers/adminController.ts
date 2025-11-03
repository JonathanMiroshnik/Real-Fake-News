import { Request, Response, NextFunction } from 'express';
import { getAllPosts, deletePost } from '../lib/lowdb/lowdbOperations.js';
import { blogDatabaseConfig } from '../lib/lowdb/databaseConfigurations.js';
import { ArticleScheme } from '../types/article.js';
import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// ============================================================================
// PRODUCTION CODE (COMMENTED OUT FOR DEBUGGING)
// ============================================================================

// // Admin password from environment variable
// const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123';

// // Text storage file
// const TEXT_STORAGE_FILE = path.join(__dirname, '../../data/adminTexts.json');

// interface TextStorage {
//   texts: string[];
// }

// // Middleware to validate admin password
// export const validateAdminPassword = (req: Request, res: Response, next: NextFunction) => {
//   const password = req.query.password as string;
  
//   if (!password || password !== ADMIN_PASSWORD) {
//     return res.status(404).json({ error: 'Not found' });
//   }
  
//   next();
// };

// // Get all articles
// export const getAllArticles = async (req: Request, res: Response) => {
//   try {
//     const articles: ArticleScheme[] = await getAllPosts<ArticleScheme>(blogDatabaseConfig);
//     res.json({ success: true, articles });
//   } catch (error) {
//     console.error('Error fetching articles:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch articles' });
//   }
// };

// // Delete an article
// export const deleteArticle = async (req: Request, res: Response) => {
//   try {
//     const { key } = req.params;
    
//     if (!key) {
//       return res.status(400).json({ success: false, error: 'Article key is required' });
//     }
    
//     const deleted = await deletePost<ArticleScheme>(key, blogDatabaseConfig);
    
//     if (deleted) {
//       res.json({ success: true, message: 'Article deleted successfully' });
//     } else {
//       res.status(404).json({ success: false, error: 'Article not found' });
//     }
//   } catch (error) {
//     console.error('Error deleting article:', error);
//     res.status(500).json({ success: false, error: 'Failed to delete article' });
//   }
// };

// // Get all texts
// export const getAllTexts = async (req: Request, res: Response) => {
//   try {
//     const db = await JSONFilePreset<TextStorage>(TEXT_STORAGE_FILE, { texts: [] });
//     res.json({ success: true, texts: db.data.texts });
//   } catch (error) {
//     console.error('Error fetching texts:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch texts' });
//   }
// };

// // Add a text
// export const addText = async (req: Request, res: Response) => {
//   try {
//     const { text } = req.body;
    
//     if (!text || typeof text !== 'string' || text.trim() === '') {
//       return res.status(400).json({ success: false, error: 'Text is required' });
//     }
    
//     const db = await JSONFilePreset<TextStorage>(TEXT_STORAGE_FILE, { texts: [] });
//     db.data.texts.push(text.trim());
//     await db.write();
    
//     res.json({ success: true, texts: db.data.texts });
//   } catch (error) {
//     console.error('Error adding text:', error);
//     res.status(500).json({ success: false, error: 'Failed to add text' });
//   }
// };

// ============================================================================
// DEBUG CODE - Accepts any password for development
// ============================================================================

// const TEXT_STORAGE_FILE = path.join(__dirname, '../../data/adminTexts.json');
const TEXT_STORAGE_FILE = path.join(process.cwd(), 'data/adminTexts.json');

interface TextStorage {
  texts: string[];
}

// DEBUG: Middleware that accepts any password
export const validateAdminPassword = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔓 DEBUG MODE: Password validation bypassed');
  // Accept any password or no password at all for debugging
  next();
};

// DEBUG: Get all articles
export const getAllArticles = async (req: Request, res: Response) => {
  try {
    const articles: ArticleScheme[] = await getAllPosts<ArticleScheme>(blogDatabaseConfig);
    console.log(`📰 DEBUG: Returning ${articles.length} articles`);
    res.json({ success: true, articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch articles' });
  }
};

// DEBUG: Delete an article
export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    console.log(`🗑️ DEBUG: Attempting to delete article with key: ${key}`);
    
    if (!key) {
      return res.status(400).json({ success: false, error: 'Article key is required' });
    }
    
    const deleted = await deletePost<ArticleScheme>(key, blogDatabaseConfig);
    
    if (deleted) {
      console.log(`✅ DEBUG: Article ${key} deleted successfully`);
      res.json({ success: true, message: 'Article deleted successfully' });
    } else {
      console.log(`❌ DEBUG: Article ${key} not found`);
      res.status(404).json({ success: false, error: 'Article not found' });
    }
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ success: false, error: 'Failed to delete article' });
  }
};

// DEBUG: Get all texts
export const getAllTexts = async (req: Request, res: Response) => {
  try {
    const db = await JSONFilePreset<TextStorage>(TEXT_STORAGE_FILE, { texts: [] });
    console.log(`📝 DEBUG: Returning ${db.data.texts.length} texts`);
    res.json({ success: true, texts: db.data.texts });
  } catch (error) {
    console.error('Error fetching texts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch texts' });
  }
};

// DEBUG: Add a text
export const addText = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    console.log(`➕ DEBUG: Adding text: "${text}"`);
    
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }
    
    const db = await JSONFilePreset<TextStorage>(TEXT_STORAGE_FILE, { texts: [] });
    db.data.texts.push(text.trim());
    await db.write();
    
    console.log(`✅ DEBUG: Text added. Total texts: ${db.data.texts.length}`);
    res.json({ success: true, texts: db.data.texts });
  } catch (error) {
    console.error('Error adding text:', error);
    res.status(500).json({ success: false, error: 'Failed to add text' });
  }
};
