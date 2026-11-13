import { Router } from 'express';
import {
  pullBlogs,
  pullBlogsByMinute,
  getRelevantArticlesController,
  getArticleByKeyController,
  getFeaturedArticleController,
} from '../controllers/blogController.js';
import { DAY_MILLISECS, ONE_HOUR_MILLISECS } from '../config/constants.js';

const router = Router();

router.get('/daily', pullBlogs(DAY_MILLISECS));
router.get('/hourly', pullBlogs(ONE_HOUR_MILLISECS));
router.get('/by-minute', pullBlogsByMinute);
router.get('/relevant', getRelevantArticlesController);
router.get('/featured', getFeaturedArticleController);
router.get('/:key', getArticleByKeyController);

export default router;
