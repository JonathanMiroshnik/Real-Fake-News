"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blogController_1 = require("../controllers/blogController");
const router = (0, express_1.Router)();
router.get('/daily', blogController_1.pullBlogs);
exports.default = router;
//# sourceMappingURL=blogRoutes.js.map