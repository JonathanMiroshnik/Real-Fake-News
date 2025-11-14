import { DatabaseConfig } from './databaseConfigurations';
// Re-export SQLite operations - this maintains backward compatibility
export { createPost, getAllPosts, getPostByKey, updatePost, deletePost } from '../database/sqliteOperations.js';

// Every type of post has a unique key property
export interface Post {
  key: string | undefined;
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
