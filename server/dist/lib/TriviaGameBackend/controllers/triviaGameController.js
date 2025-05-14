"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textToTriviaQuestions = void 0;
const triviaQuestionService_1 = require("../services/triviaQuestionService");
const textToTriviaQuestions = async (req, res) => {
    try {
        const serviceReq = {
            amount: req.body.amount,
            type: req.body.type
        };
        const results = await (0, triviaQuestionService_1.fetchTriviaQuestions)(serviceReq);
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ error: 'Game Intelligence Analysis failed' });
    }
};
exports.textToTriviaQuestions = textToTriviaQuestions;
//# sourceMappingURL=triviaGameController.js.map