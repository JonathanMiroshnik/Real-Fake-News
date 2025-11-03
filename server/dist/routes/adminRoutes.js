"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_js_1 = require("../controllers/adminController.js");
const router = (0, express_1.Router)();
// ============================================================================
// PRODUCTION CODE (COMMENTED OUT FOR DEBUGGING)
// ============================================================================
// // All admin routes require password validation
// router.use(validateAdminPassword);
// // Article management routes
// router.get('/articles', getAllArticles);
// router.delete('/articles/:key', deleteArticle);
// // Text management routes
// router.get('/texts', getAllTexts);
// router.post('/texts', addText);
// ============================================================================
// DEBUG CODE - Password validation bypassed
// ============================================================================
// DEBUG: Password validation middleware (accepts any password)
router.use(adminController_js_1.validateAdminPassword);
// Article management routes
router.get('/articles', adminController_js_1.getAllArticles);
// router.delete('/articles/:key', deleteArticle);
// Text management routes
router.get('/texts', adminController_js_1.getAllTexts);
// router.post('/texts', addText);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map