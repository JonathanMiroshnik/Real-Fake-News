import { Router } from 'express';
import { textToTriviaQuestions } from '../controllers/triviaGameController';

const router = Router();

router.post('/', textToTriviaQuestions);

export default router;