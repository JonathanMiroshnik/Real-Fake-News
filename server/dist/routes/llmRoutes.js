"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const llmController_1 = require("../controllers/llmController");
const router = (0, express_1.Router)();
router.post('/analyze', llmController_1.promptText);
exports.default = router;
//# sourceMappingURL=llmRoutes.js.map