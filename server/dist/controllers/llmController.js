"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptText = void 0;
exports.generateTextFromString = generateTextFromString;
const llmService_1 = require("../services/llmService");
const promptText = async (req, res) => {
    try {
        const request = {
            provider: 'deepseek',
            prompt: req.body.text,
            type: 'text'
        };
        const llmServiceInst = new llmService_1.LLMService();
        const result = await llmServiceInst.generateContent(request);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Analysis failed' });
    }
};
exports.promptText = promptText;
async function generateTextFromString(prompt, type = 'text', temperature = 0.8) {
    try {
        const request = {
            provider: 'deepseek',
            prompt: prompt,
            type: type,
            temperature: temperature
        };
        const llmServiceInst = new llmService_1.LLMService();
        const result = await llmServiceInst.generateContent(request);
        return result;
    }
    catch (error) {
        console.log("Text Generation error: ", error);
        throw new Error('Text generation from string failed');
    }
}
//# sourceMappingURL=llmController.js.map