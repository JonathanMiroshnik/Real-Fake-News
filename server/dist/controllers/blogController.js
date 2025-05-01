"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pullBlogs = exports.ONE_HOUR_MILLISECS = exports.DAY_MILLISECS = void 0;
exports.getPostsAfterDate = getPostsAfterDate;
exports.pullHourlyBlogs = pullHourlyBlogs;
const blogService_1 = require("../services/blogService");
// Calculated in milliseconds
exports.DAY_MILLISECS = 24 * 60 * 60 * 1000;
exports.ONE_HOUR_MILLISECS = 60 * 60 * 1000;
;
// Currently set up to pull only the DAILY blog posts, the request does not matter
const pullBlogs = async (req, res) => {
    console.log('Pulling blogs!');
    try {
        const result = await getPostsAfterDate(new Date(Date.now() - exports.DAY_MILLISECS));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Analysis failed' });
    }
};
exports.pullBlogs = pullBlogs;
// TODO: too small a function but useful in other places.
async function getPostsAfterDate(afterDate) {
    const request = {
        writer: "",
        afterDate: afterDate
    };
    const result = await (0, blogService_1.getAllPostsAfterDate)(request.afterDate);
    return result;
}
async function pullHourlyBlogs(req, res) {
    console.log('Pulling hourly blogs!');
    try {
        const result = await getPostsAfterDate(new Date(Date.now() - exports.ONE_HOUR_MILLISECS));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Analysis failed' });
    }
}
//# sourceMappingURL=blogController.js.map