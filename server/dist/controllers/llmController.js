"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptText = void 0;
const llmService_1 = require("../services/llmService");
const promptText = async (req, res) => {
    try {
        console.log(req.body);
        const request = {
            provider: 'deepseek',
            prompt: req.body.text,
        };
        console.log("1");
        const llmServiceInst = new llmService_1.LLMService();
        console.log("2");
        const result = await llmServiceInst.generateContent(request);
        console.log("3");
        res.json(result);
        console.log("4");
    }
    catch (error) {
        res.status(500).json({ error: 'Analysis failed' });
    }
};
exports.promptText = promptText;
//# sourceMappingURL=llmController.js.map