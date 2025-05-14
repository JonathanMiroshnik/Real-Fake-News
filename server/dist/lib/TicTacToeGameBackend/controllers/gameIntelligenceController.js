"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textToGameAnalysis = void 0;
const gameIntelligenceService_1 = require("../services/gameIntelligenceService");
const textToGameAnalysis = async (req, res) => {
    try {
        const serviceReq = {
            boardState: req.body.board,
            dice: req.body.dice,
            symbol: req.body.symbol
        };
        const result = await (0, gameIntelligenceService_1.chooseNextAction)(serviceReq);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Game Intelligence Analysis failed' });
    }
};
exports.textToGameAnalysis = textToGameAnalysis;
//# sourceMappingURL=gameIntelligenceController.js.map