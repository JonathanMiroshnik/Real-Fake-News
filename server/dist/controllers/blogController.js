"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pullBlogs = exports.TIME_BEFORE = void 0;
exports.getPostsAfterDate = getPostsAfterDate;
const blogService_1 = require("../services/blogService");
// Calculated in milliseconds
exports.TIME_BEFORE = 24 * 60 * 60 * 1000;
// Currently set up to pull only the DAILY blog posts, the request does not matter
const pullBlogs = async (req, res) => {
    console.log('Pulling blogs!');
    try {
        const result = await getPostsAfterDate(new Date(Date.now() - exports.TIME_BEFORE));
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
//# sourceMappingURL=blogController.js.map