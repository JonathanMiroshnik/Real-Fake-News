import { Router } from 'express';
import { getAdminArticles, getAdminArticlesCount, getAdminArticle, updateAdminArticle, deleteAdminArticle, setFeaturedArticle, uploadAdminImage, uploadMiddleware, getAdminTexts, addAdminText, generateAdminArticle, generateAdminRecipe } from '../controllers/adminController.js';

const router = Router();

// Admin routes - password protected via query parameter
router.get('/articles', getAdminArticles);
router.get('/articles/count', getAdminArticlesCount);
router.get('/articles/:key', getAdminArticle);
router.put('/articles/:key', updateAdminArticle);
router.put('/articles/:key/featured', setFeaturedArticle);
router.delete('/articles/:key', deleteAdminArticle);
router.post('/images/upload', uploadMiddleware, uploadAdminImage);
router.get('/texts', getAdminTexts);
router.post('/texts', addAdminText);
router.post('/generate/article', generateAdminArticle);
router.post('/generate/recipe', generateAdminRecipe);

export default router;
