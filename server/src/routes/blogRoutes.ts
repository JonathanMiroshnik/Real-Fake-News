import { Router } from 'express';
import { pullBlogs, pullHourlyBlogs } from '../controllers/blogController.js';

const router = Router();

router.get('/daily', pullBlogs);
router.get('/hourly', pullHourlyBlogs);

export default router;