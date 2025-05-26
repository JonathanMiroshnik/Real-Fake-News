import 'dotenv/config';
import { GenerateContentRequest, GenerateContentResponse } from '../types/llm.js';
export declare class LLMService {
    private openai;
    constructor();
    generateContent(options: GenerateContentRequest): Promise<GenerateContentResponse>;
}
export declare function generateTextFromString(prompt: string, type?: string, temperature?: number): Promise<GenerateContentResponse | undefined>;
export declare function getBooleanResponse(prompt: string, temperature?: number): Promise<boolean>;
