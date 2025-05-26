import { Request, Response } from 'express';
import { LLMService } from '../services/llmService.js';
import { GenerateContentRequest, GenerateContentResponse } from '../types/llm.d.js';

export const promptText = async (req: Request, res: Response) => {
    try {
        const request: GenerateContentRequest = {
            provider: 'deepseek',
            prompt: req.body.text,
            type: 'text'
        };
        
        const llmServiceInst = new LLMService();
        const result = await llmServiceInst.generateContent(request);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Analysis failed' });
    }
};
