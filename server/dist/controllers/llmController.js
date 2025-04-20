"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptText = void 0;
const llmService_1 = require("../services/llmService");
const promptText = async (req, res) => {
    try {
        console.log("check");
        const request = {
            provider: 'deepseek',
            prompt: req.body.text,
        };
        console.log(req.body.text);
        const llmServiceInst = new llmService_1.LLMService();
        const result = await llmServiceInst.generateContent(request);
        console.log(result);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Analysis failed' });
    }
};
exports.promptText = promptText;
//# sourceMappingURL=llmController.js.map