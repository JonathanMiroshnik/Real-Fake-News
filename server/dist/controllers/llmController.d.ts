import { Request, Response } from 'express';
import { GenerateContentResponse } from '../types/llm.d';
export declare const promptText: (req: Request, res: Response) => Promise<void>;
export declare function generateTextFromString(prompt: string, type?: string, temperature?: number): Promise<GenerateContentResponse | undefined>;
//# sourceMappingURL=llmController.d.ts.map