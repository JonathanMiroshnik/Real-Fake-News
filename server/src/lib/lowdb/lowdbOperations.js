"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.deletePost = exports.updatePost = exports.getPostByKey = exports.getAllPosts = exports.createPost = exports.getUniqueKey = void 0;
var uuid_1 = require("uuid");
var node_1 = require("lowdb/node");
// import { DB_BLOG_POST_FILE } from '../../config/constants.js';
// TODO: should not have this function and just import uuidv4 where needed?
function getUniqueKey() {
    return (0, uuid_1.v4)();
}
exports.getUniqueKey = getUniqueKey;
// CRUD OPERATIONS //
// Create - Add new post
function createPost(post, dbFile) {
    return __awaiter(this, void 0, void 0, function () {
        var db, exists;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, node_1.JSONFilePreset)(dbFile, { posts: [] })];
                case 1:
                    db = _a.sent();
                    exists = db.data.posts.some(function (p) { return p.key === post.key; });
                    if (exists) {
                        // TODO: figure out way to print the problematic key?
                        // throw new Error(`Post with provided key already exists`);
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, db.update(function (_a) {
                            var posts = _a.posts;
                            return posts.push(post);
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.createPost = createPost;
// Read - Get all posts
function getAllPosts(dbFile) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, node_1.JSONFilePreset)(dbFile, { posts: [] })];
                case 1:
                    db = _a.sent();
                    return [2 /*return*/, db.data.posts];
            }
        });
    });
}
exports.getAllPosts = getAllPosts;
// Read - Get post by ID
function getPostByKey(key, dbFile) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, node_1.JSONFilePreset)(dbFile, { posts: [] })];
                case 1:
                    db = _a.sent();
                    return [2 /*return*/, db.data.posts.find(function (p) { return p.key === key; })];
            }
        });
    });
}
exports.getPostByKey = getPostByKey;
function copyValues(source, target) {
    Object.keys(source).forEach(function (k) {
        target[k] = source[k];
    });
}
// Update - Modify post content
function updatePost(newPost, dbFile) {
    return __awaiter(this, void 0, void 0, function () {
        var db, post;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, node_1.JSONFilePreset)(dbFile, { posts: [] })];
                case 1:
                    db = _a.sent();
                    post = db.data.posts.find(function (p) { return p.key === newPost.key; });
                    if (!post)
                        return [2 /*return*/, false];
                    copyValues(newPost, post);
                    return [4 /*yield*/, db.write()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.updatePost = updatePost;
// Delete - Remove post by ID
function deletePost(key, dbFile) {
    return __awaiter(this, void 0, void 0, function () {
        var db, initialLength;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, node_1.JSONFilePreset)(dbFile, { posts: [] })];
                case 1:
                    db = _a.sent();
                    initialLength = db.data.posts.length;
                    db.data.posts = db.data.posts.filter(function (p) { return p.key !== key; });
                    if (db.data.posts.length === initialLength)
                        return [2 /*return*/, false];
                    return [4 /*yield*/, db.write()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.deletePost = deletePost;
// // EXAMPLE USAGE
// export default async function crudTest() {
//   // Initialize with test data
//   const testPost: Post = { key: "1" };
//   // Create - Add new post
//   await createPost<Post>(testPost, DB_BLOG_POST_FILE);
//   console.log('Created post:', testPost);
//   // Read - Get all posts
//   const allPosts = await getAllPosts<Post>(DB_BLOG_POST_FILE);
//   console.log('All posts:', allPosts);
//   // Read - Get specific post
//   const foundPost = await getPostByKey<Post>("1", DB_BLOG_POST_FILE);
//   console.log('Found post:', foundPost);
//   // Update - Modify post
//   if (foundPost) {
//     const k: Post = {key: "1"}
//     await updatePost<Post>(k, DB_BLOG_POST_FILE);
//     console.log('Post updated');
//   }
//   // Delete - Remove post
//   const deleted = await deletePost("1", DB_BLOG_POST_FILE);
//   console.log('Post deleted:', deleted);
// }
// Execute main example
// crudTest().catch(console.error);
