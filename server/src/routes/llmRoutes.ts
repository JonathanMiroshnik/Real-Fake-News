import { Router } from 'express';
import { promptText } from '../controllers/llmController.js';

const router = Router();

router.post('/analyze', promptText);

export default router;