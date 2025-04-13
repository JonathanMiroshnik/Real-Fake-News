import { Router } from 'express';
import { promptText } from '../controllers/llmController';

const router = Router();

router.post('/analyze', promptText);

export default router;