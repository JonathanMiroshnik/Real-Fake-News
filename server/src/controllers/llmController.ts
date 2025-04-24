import { Request, Response } from 'express';
import { LLMService } from '../services/llmService';
import { GenerateContentRequest, GenerateContentResponse } from '../types/llm.d';

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

export async function generateTextFromString(prompt: string, type: string = 'text'): Promise<GenerateContentResponse | undefined> {
    try {
        const request: GenerateContentRequest = {
            provider: 'deepseek',
            prompt: prompt,
            type: type
        };
        
        const llmServiceInst = new LLMService();
        const result = await llmServiceInst.generateContent(request);

        return result;
    } catch (error) {
        console.log("Text Generation error: ", error);
        throw new Error('Text generation from string failed');
    }
}
