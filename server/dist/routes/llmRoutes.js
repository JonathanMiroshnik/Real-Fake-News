"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const llmController_js_1 = require("../controllers/llmController.js");
const router = (0, express_1.Router)();
router.post('/analyze', llmController_js_1.promptText);
exports.default = router;
//# sourceMappingURL=llmRoutes.js.map