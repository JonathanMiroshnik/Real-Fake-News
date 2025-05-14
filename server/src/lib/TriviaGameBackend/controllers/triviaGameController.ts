import { Request, Response } from 'express';
import { GenerateTriviaQuestionsRequest } from '../types/triviaGame';
import { fetchTriviaQuestions } from '../services/triviaQuestionService';

export const textToTriviaQuestions = async (req: Request, res: Response) => {
    try {
        const serviceReq: GenerateTriviaQuestionsRequest = {
            amount: req.body.amount,
            type: req.body.type
        };

        const results = await fetchTriviaQuestions(serviceReq);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Game Intelligence Analysis failed' });
    }
};
