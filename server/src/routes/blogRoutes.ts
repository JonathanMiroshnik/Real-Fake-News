import { Router } from 'express';
import { pullBlogs, pullHourlyBlogs, pullBlogsByMinute } from '../controllers/blogController.js';

const router = Router();

router.get('/daily', pullBlogs);
router.get('/hourly', pullHourlyBlogs);
router.get('/by-minute', pullBlogsByMinute);


export default router;