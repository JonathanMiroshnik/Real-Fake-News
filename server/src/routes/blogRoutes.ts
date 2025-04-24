import { Router } from 'express';
import { pullBlogs } from '../controllers/blogController';

const router = Router();

router.get('/daily', pullBlogs);

export default router;