import { Request, Response } from 'express';
import { LLMService } from '../services/llmService';
import { GenerateContentRequest } from '../types/llm.d';

export const promptText = async (req: Request, res: Response) => {
    try {
        const request: GenerateContentRequest = {
            provider: 'deepseek',
            prompt: req.body.text,
        };
        
        const llmServiceInst = new LLMService();
        const result = await llmServiceInst.generateContent(request);
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Analysis failed' });
    }
};