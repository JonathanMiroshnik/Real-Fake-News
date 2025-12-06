import { Request, Response } from 'express';
import { chooseNextAction } from '../services/gameIntelligenceService.js';
import { GenerateGameMoveRequest } from '../types/gameIntelligence.js';

export const textToGameAnalysis = async (req: Request, res: Response) => {
    try {
        const serviceReq: GenerateGameMoveRequest = {
            boardState: req.body.board,
            dice: req.body.dice,
            symbol: req.body.symbol
        };
        
        const result = await chooseNextAction(serviceReq);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Game Intelligence Analysis failed' });
    }
};
