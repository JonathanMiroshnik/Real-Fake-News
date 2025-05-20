"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pullBlogs = void 0;
exports.pullHourlyBlogs = pullHourlyBlogs;
exports.pullBlogsByMinute = pullBlogsByMinute;
const blogService_js_1 = require("../services/blogService.js");
const constants_js_1 = require("../config/constants.js");
// TODO: some functions need to be combined here
// Currently set up to pull only the DAILY blog posts, the request does not matter
const pullBlogs = async (req, res) => {
    console.log('Pulling blogs!');
    try {
        const result = await (0, blogService_js_1.getPostsAfterDate)(new Date(Date.now() - constants_js_1.DAY_MILLISECS));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Analysis failed' });
    }
};
exports.pullBlogs = pullBlogs;
async function pullHourlyBlogs(req, res) {
    console.log('Pulling hourly blogs!');
    try {
        const result = await (0, blogService_js_1.getPostsAfterDate)(new Date(Date.now() - constants_js_1.ONE_HOUR_MILLISECS));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Analysis failed' });
    }
}
async function pullBlogsByMinute(req, res) {
    try {
        const minutes = parseInt(req.query.minute, 10);
        if (isNaN(minutes)) {
            res.status(400).json({ error: 'Invalid minute value' });
            return;
        }
        const result = await (0, blogService_js_1.getPostsAfterDate)(new Date(Date.now() - minutes * 60 * 1000));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Analysis failed' });
    }
}
//# sourceMappingURL=blogController.js.map