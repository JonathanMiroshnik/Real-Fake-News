"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPostsAfterDate = getAllPostsAfterDate;
require("dotenv/config");
const lowdbOperations_js_1 = require("../lib/lowdb/lowdbOperations.js");
const constants_js_1 = require("../config/constants.js");
async function getAllPostsAfterDate(startDate) {
    const allArticles = await (0, lowdbOperations_js_1.getAllPosts)(constants_js_1.DB_BLOG_POST_FILE);
    const retArticles = allArticles.filter(article => {
        if (!article.timestamp)
            return false;
        try {
            const articleDate = new Date(article.timestamp);
            const startTime = startDate.getTime();
            return articleDate.getTime() > startTime;
        }
        catch (e) {
            console.error('Invalid date format:', article.timestamp);
            return false;
        }
    });
    return {
        success: true,
        articles: retArticles,
        error: ""
    };
}
//# sourceMappingURL=blogService.js.map