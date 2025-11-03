import { Router } from 'express';
import { 
  getAllArticles, 
  deleteArticle, 
  getAllTexts, 
  addText,
  validateAdminPassword 
} from '../controllers/adminController.js';

const router = Router();

// ============================================================================
// PRODUCTION CODE (COMMENTED OUT FOR DEBUGGING)
// ============================================================================

// // All admin routes require password validation
// router.use(validateAdminPassword);

// // Article management routes
// router.get('/articles', getAllArticles);
// router.delete('/articles/:key', deleteArticle);

// // Text management routes
// router.get('/texts', getAllTexts);
// router.post('/texts', addText);

// ============================================================================
// DEBUG CODE - Password validation bypassed
// ============================================================================

// DEBUG: Password validation middleware (accepts any password)
router.use(validateAdminPassword);

// Article management routes
router.get('/articles', getAllArticles);
// router.delete('/articles/:key', deleteArticle);

// Text management routes
router.get('/texts', getAllTexts);
// router.post('/texts', addText);

export default router;
