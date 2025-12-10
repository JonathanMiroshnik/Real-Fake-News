import { Router } from 'express';
import { getAdminArticles, getAdminArticlesCount, getAdminArticle, updateAdminArticle, deleteAdminArticle, uploadAdminImage, uploadMiddleware, getAdminTexts, addAdminText } from '../controllers/adminController.js';

const router = Router();

// Admin routes - password protected via query parameter
router.get('/articles', getAdminArticles);
router.get('/articles/count', getAdminArticlesCount);
router.get('/articles/:key', getAdminArticle);
router.put('/articles/:key', updateAdminArticle);
router.delete('/articles/:key', deleteAdminArticle);
router.post('/images/upload', uploadMiddleware, uploadAdminImage);
router.get('/texts', getAdminTexts);
router.post('/texts', addAdminText);

export default router;
