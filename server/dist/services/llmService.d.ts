import 'dotenv/config';
import { GenerateContentRequest, GenerateContentResponse } from '../types/llm.js';
export declare class LLMService {
    private openai;
    constructor();
    generateContent(options: GenerateContentRequest): Promise<GenerateContentResponse>;
}
