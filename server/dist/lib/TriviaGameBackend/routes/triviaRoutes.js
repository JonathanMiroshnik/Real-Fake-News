"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const triviaGameController_1 = require("../controllers/triviaGameController");
const router = (0, express_1.Router)();
router.post('/', triviaGameController_1.textToTriviaQuestions);
exports.default = router;
//# sourceMappingURL=triviaRoutes.js.map