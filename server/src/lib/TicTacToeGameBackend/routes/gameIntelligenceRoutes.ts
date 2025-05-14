import { Router } from 'express';
import { textToGameAnalysis } from '../controllers/gameIntelligenceController';

const router = Router();

router.post('/', textToGameAnalysis);

export default router;