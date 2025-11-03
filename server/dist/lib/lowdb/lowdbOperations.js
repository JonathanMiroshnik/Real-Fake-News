"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPost = createPost;
exports.getAllPosts = getAllPosts;
exports.getPostByKey = getPostByKey;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
const node_1 = require("lowdb/node");
// // CRUD OPERATIONS //
// // Create - Add new post
// export async function createPost<T extends Post>(post: T, dbFile: string): Promise<boolean> {
//   const db = await JSONFilePreset<Schema<T>>(dbFile, { posts: [] });
//   // Check for existing ID
//   const exists = db.data.posts.some(p => p.key === post.key);
//   if (exists) {
//     // TODO: figure out way to print the problematic key?
//     // throw new Error(`Post with provided key already exists`);
//     return false;
//   }
//   await db.update(({ posts }) => posts.push(post));
//   return true;
// }
// // Read - Get all posts
// export async function getAllPosts<T extends Post>(dbFile: string): Promise<T[]> {
//   const db = await JSONFilePreset<Schema<T>>(dbFile, { posts: [] });
//   return db.data.posts;
// }
// // Read - Get post by ID
// export async function getPostByKey<T extends Post>(key: string, dbFile: string): Promise<T | undefined> {
//   const db = await JSONFilePreset<Schema<T>>(dbFile, { posts: [] });
//   return db.data.posts.find(p => p.key === key);
// }
// function copyValues<T extends Post>(source: T, target: T): void {
//   (Object.keys(source) as Array<keyof T>).forEach(k => {
//       target[k] = source[k];
//   });
// }
// // Update - Modify post content
// export async function updatePost<T extends Post>(newPost: T, dbFile: string): Promise<boolean> {
//   const db = await JSONFilePreset<Schema<T>>(dbFile, { posts: [] });
//   const post = db.data.posts.find(p => p.key === newPost.key);
//   if (!post) return false;
//   copyValues<T>(newPost, post);
//   await db.write();
//   return true;
// }
// // Delete - Remove post by ID
// export async function deletePost<T extends Post>(key: string, dbFile: string): Promise<boolean> {
//   const db = await JSONFilePreset<Schema<T>>(dbFile, { posts: [] });
//   const initialLength = db.data.posts.length;
//   db.data.posts = db.data.posts.filter(p => p.key !== key);
//   if (db.data.posts.length === initialLength) return false;
//   await db.write();
//   return true;
// }
// CRUD OPERATIONS //
// Create - Add new post
async function createPost(post, dbConfig) {
    const db = await (0, node_1.JSONFilePreset)(dbConfig.source, { posts: [] });
    // Check for existing ID
    if (await dbConfig.exists(post)) {
        // TODO: figure out way to print the problematic key?
        // throw new Error(`Post with provided key already exists`);
        return false;
    }
    await db.update(({ posts }) => posts.push(post));
    return true;
}
// Read - Get all posts
async function getAllPosts(dbConfig) {
    const db = await (0, node_1.JSONFilePreset)(dbConfig.source, { posts: [] });
    return db.data.posts;
}
// Read - Get post by ID
async function getPostByKey(key, dbConfig) {
    const db = await (0, node_1.JSONFilePreset)(dbConfig.source, { posts: [] });
    return dbConfig.find(key);
}
// Update - Modify post content
async function updatePost(newPost, dbConfig) {
    const db = await (0, node_1.JSONFilePreset)(dbConfig.source, { posts: [] });
    const post = await dbConfig.find(await dbConfig.getKey(newPost));
    if (!post)
        return false;
    dbConfig.copyValues(newPost, post);
    await db.write();
    return true;
}
// Delete - Remove post by ID
async function deletePost(key, dbConfig) {
    const db = await (0, node_1.JSONFilePreset)(dbConfig.source, { posts: [] });
    const initialLength = db.data.posts.length;
    // Get all keys asynchronously and filter
    const keysToCheck = await Promise.all(db.data.posts.map(p => dbConfig.getKey(p)));
    db.data.posts = db.data.posts.filter((p, index) => keysToCheck[index] !== key);
    if (db.data.posts.length === initialLength)
        return false;
    await db.write();
    return true;
}
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