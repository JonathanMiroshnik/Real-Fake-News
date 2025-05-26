"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMService = void 0;
exports.generateTextFromString = generateTextFromString;
exports.getBooleanResponse = getBooleanResponse;
require("dotenv/config");
const openai_1 = require("openai");
// TODO: add other such service activated flags in the other services!
const SERVICE_ACTIVATED = true;
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
        if (!SERVICE_ACTIVATED) {
            return contentRes;
        }
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
async function generateTextFromString(prompt, type = 'text', temperature = 0.8) {
    try {
        const request = {
            provider: 'deepseek',
            prompt: prompt,
            type: type,
            temperature: temperature
        };
        const llmServiceInst = new LLMService();
        const result = await llmServiceInst.generateContent(request);
        return result;
    }
    catch (error) {
        console.log("Text Generation error: ", error);
        throw new Error('Text generation from string failed');
    }
}
async function getBooleanResponse(prompt, temperature = 0.1 // Lower temperature for deterministic output
) {
    try {
        // Force the model to respond with only "true" or "false"
        const strictPrompt = `
      Answer the following question with **only** "true" or "false". 
      Do not provide any explanation or additional text.
      Question: ${prompt}
    `;
        const response = await generateTextFromString(strictPrompt, 'text', // text or 'json_object' if DeepSeek supports it
        temperature);
        if (!response?.success || !response.generatedText) {
            throw new Error("Failed to get a valid response from the model.");
        }
        const normalizedAnswer = response.generatedText.trim().toLowerCase();
        if (normalizedAnswer === "true")
            return true;
        if (normalizedAnswer === "false")
            return false;
        throw new Error(`Model returned an invalid boolean response: "${response.generatedText}"`);
    }
    catch (error) {
        console.error("Boolean response generation failed:", error);
        throw new Error(`Could not determine boolean answer: ${error instanceof Error ? error.message : String(error)}`);
    }
}
//# sourceMappingURL=llmService.js.map