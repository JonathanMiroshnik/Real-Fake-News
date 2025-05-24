import { Router } from 'express';
import { breakupAuth } from '../controllers/authController';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

router.post('/google', breakupAuth);

export default router;