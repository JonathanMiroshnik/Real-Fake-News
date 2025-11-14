"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.getPostByKey = exports.getAllPosts = exports.createPost = void 0;
// Re-export SQLite operations - this maintains backward compatibility
var sqliteOperations_js_1 = require("../database/sqliteOperations.js");
Object.defineProperty(exports, "createPost", { enumerable: true, get: function () { return sqliteOperations_js_1.createPost; } });
Object.defineProperty(exports, "getAllPosts", { enumerable: true, get: function () { return sqliteOperations_js_1.getAllPosts; } });
Object.defineProperty(exports, "getPostByKey", { enumerable: true, get: function () { return sqliteOperations_js_1.getPostByKey; } });
Object.defineProperty(exports, "updatePost", { enumerable: true, get: function () { return sqliteOperations_js_1.updatePost; } });
Object.defineProperty(exports, "deletePost", { enumerable: true, get: function () { return sqliteOperations_js_1.deletePost; } });
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
//# sourceMappingURL=lowdbOperations.js.map