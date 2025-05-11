import { Request, Response } from 'express';
import { GenerateContentResponse } from '../types/llm.d.js';
export declare const promptText: (req: Request, res: Response) => Promise<void>;
export declare function generateTextFromString(prompt: string, type?: string, temperature?: number): Promise<GenerateContentResponse | undefined>;
