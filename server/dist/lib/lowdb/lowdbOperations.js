"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUniqueKey = getUniqueKey;
exports.createPost = createPost;
exports.getAllPosts = getAllPosts;
exports.getPostByKey = getPostByKey;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
exports.default = crudTest;
const uuid_1 = require("uuid");
const node_1 = require("lowdb/node");
const constants_1 = require("../../config/constants");
// TODO: should not have this function and just import uuidv4 where needed?
function getUniqueKey() {
    return (0, uuid_1.v4)();
}
// CRUD OPERATIONS //
// Create - Add new post
async function createPost(post, dbFile) {
    const db = await (0, node_1.JSONFilePreset)(dbFile, { posts: [] });
    // Check for existing ID
    const exists = db.data.posts.some(p => p.key === post.key);
    if (exists) {
        // TODO: figure out way to print the problematic key?
        throw new Error(`Post with provided key already exists`);
    }
    await db.update(({ posts }) => posts.push(post));
}
// Read - Get all posts
async function getAllPosts(dbFile) {
    const db = await (0, node_1.JSONFilePreset)(dbFile, { posts: [] });
    return db.data.posts;
}
// Read - Get post by ID
async function getPostByKey(key, dbFile) {
    const db = await (0, node_1.JSONFilePreset)(dbFile, { posts: [] });
    return db.data.posts.find(p => p.key === key);
}
function copyValues(source, target) {
    Object.keys(source).forEach(k => {
        target[k] = source[k];
    });
}
// Update - Modify post content
async function updatePost(newPost, dbFile) {
    const db = await (0, node_1.JSONFilePreset)(dbFile, { posts: [] });
    const post = db.data.posts.find(p => p.key === newPost.key);
    if (!post)
        return false;
    copyValues(newPost, post);
    await db.write();
    return true;
}
// Delete - Remove post by ID
async function deletePost(key, dbFile) {
    const db = await (0, node_1.JSONFilePreset)(dbFile, { posts: [] });
    const initialLength = db.data.posts.length;
    db.data.posts = db.data.posts.filter(p => p.key !== key);
    if (db.data.posts.length === initialLength)
        return false;
    await db.write();
    return true;
}
// EXAMPLE USAGE
async function crudTest() {
    // Initialize with test data
    const testPost = { key: "1" };
    // Create - Add new post
    await createPost(testPost, constants_1.DB_BLOG_POST_FILE);
    console.log('Created post:', testPost);
    // Read - Get all posts
    const allPosts = await getAllPosts(constants_1.DB_BLOG_POST_FILE);
    console.log('All posts:', allPosts);
    // Read - Get specific post
    const foundPost = await getPostByKey("1", constants_1.DB_BLOG_POST_FILE);
    console.log('Found post:', foundPost);
    // Update - Modify post
    if (foundPost) {
        const k = { key: "1" };
        await updatePost(k, constants_1.DB_BLOG_POST_FILE);
        console.log('Post updated');
    }
    // Delete - Remove post
    const deleted = await deletePost("1", constants_1.DB_BLOG_POST_FILE);
    console.log('Post deleted:', deleted);
}
// Execute main example
// crudTest().catch(console.error);
//# sourceMappingURL=lowdbOperations.js.map