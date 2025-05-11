"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blogController_js_1 = require("../controllers/blogController.js");
const router = (0, express_1.Router)();
router.get('/daily', blogController_js_1.pullBlogs);
router.get('/hourly', blogController_js_1.pullHourlyBlogs);
exports.default = router;
//# sourceMappingURL=blogRoutes.js.map