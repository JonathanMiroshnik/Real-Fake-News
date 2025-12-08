import { Router } from 'express';
import { pullBlogs, pullHourlyBlogs, pullBlogsByMinute, getRelevantArticlesController, getArticleByKeyController } from '../controllers/blogController.js';

const router = Router();

router.get('/daily', pullBlogs);
router.get('/hourly', pullHourlyBlogs);
router.get('/by-minute', pullBlogsByMinute);
router.get('/relevant', getRelevantArticlesController);
router.get('/:key', getArticleByKeyController);


export default router;