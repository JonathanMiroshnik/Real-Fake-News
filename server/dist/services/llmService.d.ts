import 'dotenv/config';
import { GenerateContentRequest, GenerateContentResponse } from '../types/llm';
export declare class LLMService {
    private openai;
    constructor();
    generateContent(options: GenerateContentRequest): Promise<GenerateContentResponse>;
}
//# sourceMappingURL=llmService.d.ts.map