"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMService = void 0;
require("dotenv/config");
const openai_1 = require("openai");
class LLMService {
    openai;
    constructor() {
        // TODO: magic strings
        this.openai = new openai_1.OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: process.env.DEEPSEEK_API_KEY
        });
    }
    async generateContent(options) {
        let contentRes = {
            success: false,
            generatedText: "",
            error: ""
        };
        try {
            // TODO: fix model and make it in .env as a dictionary?
            const completion = await this.openai.chat.completions.create({
                messages: [{ role: "system", content: options.prompt }],
                model: "deepseek-chat",
                response_format: {
                    'type': options.type
                }
            });
            // TODO: what do I do with the return statement here with the ? parts
            contentRes = {
                success: true,
                generatedText: completion?.choices[0]?.message.content,
                error: ""
            };
            // return completion?.choices[0]?.message.content as string;
        }
        catch (error) {
            // TODO: no point not returning this?
            contentRes = {
                success: false,
                generatedText: "",
                error: error
            };
            console.log('LLM generation error:', error);
            throw new Error('Content generation failed');
        }
        return contentRes;
    }
}
exports.LLMService = LLMService;
//# sourceMappingURL=llmService.js.map