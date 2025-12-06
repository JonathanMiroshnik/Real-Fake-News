import { Router } from 'express';
import { textToGameAnalysis } from '../controllers/gameIntelligenceController.js';

const router = Router();

router.post('/', textToGameAnalysis);

export default router;