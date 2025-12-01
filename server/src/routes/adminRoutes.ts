import { Router } from 'express';
import { getAdminArticles, deleteAdminArticle, getAdminTexts, addAdminText } from '../controllers/adminController.js';

const router = Router();

// Admin routes - password protected via query parameter
router.get('/articles', getAdminArticles);
router.delete('/articles/:key', deleteAdminArticle);
router.get('/texts', getAdminTexts);
router.post('/texts', addAdminText);

export default router;
