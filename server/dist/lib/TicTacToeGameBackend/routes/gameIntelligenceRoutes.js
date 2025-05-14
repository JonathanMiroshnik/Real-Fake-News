"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gameIntelligenceController_1 = require("../controllers/gameIntelligenceController");
const router = (0, express_1.Router)();
router.post('/', gameIntelligenceController_1.textToGameAnalysis);
exports.default = router;
//# sourceMappingURL=gameIntelligenceRoutes.js.map