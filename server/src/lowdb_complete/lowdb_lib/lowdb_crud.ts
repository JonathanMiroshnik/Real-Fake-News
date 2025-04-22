// Import LowDB's JSONFilePreset for file-based storage
import { JSONFilePreset } from 'lowdb/node'
import { DB_BLOG_POST_FILE } from './lowdb_databases';

// Every type of post has a unique key property
export interface Post {
  key: string;
}

// Main database schema type, 
//  multiple posts can be gotten at once and that's why it's an array
type Schema<T extends Post> = {
  posts: T[];
}

// CRUD OPERATIONS //

// Create - Add new post
export async function createPost<T extends Post>(post: T, dbFile: string) {
  const db = await JSONFilePreset<Schema<T>>(dbFile, { posts: [] });
  // Check for existing ID
  const exists = db.data.posts.some(p => p.key === post.key);
  if (exists) {
    // TODO: figure out way to print the problematic key?
    throw new Error(`Post with provided key already exists`);
  }

  await db.update(({ posts }) => posts.push(post));
}

// Read - Get all posts
export async function getAllPosts<T extends Post>(dbFile: string): Promise<T[]> {
  const db = await JSONFilePreset<Schema<T>>(dbFile, { posts: [] });
  return db.data.posts;
}

// Read - Get post by ID
export async function getPostByKey<T extends Post>(key: string, dbFile: string): Promise<T | undefined> {
  const db = await JSONFilePreset<Schema<T>>(dbFile, { posts: [] });
  return db.data.posts.find(p => p.key === key);
}

function copyValues<T extends Post>(source: T, target: T): void {
  (Object.keys(source) as Array<keyof T>).forEach(k => {
      target[k] = source[k];
  });
}

// Update - Modify post content
export async function updatePost<T extends Post>(newPost: T, dbFile: string): Promise<boolean> {
  const db = await JSONFilePreset<Schema<T>>(dbFile, { posts: [] });
  const post = db.data.posts.find(p => p.key === newPost.key);
  if (!post) return false;

  copyValues<T>(newPost, post);
  await db.write();
  return true;
}

// Delete - Remove post by ID
export async function deletePost<T extends Post>(key: string, dbFile: string): Promise<boolean> {
  const db = await JSONFilePreset<Schema<T>>(dbFile, { posts: [] });
  const initialLength = db.data.posts.length;

  db.data.posts = db.data.posts.filter(p => p.key !== key);
  if (db.data.posts.length === initialLength) return false;

  await db.write();
  return true;
}

// EXAMPLE USAGE
export default async function crudTest() {
  // Initialize with test data
  const testPost: Post = { key: "1" };

  // Create - Add new post
  await createPost<Post>(testPost, DB_BLOG_POST_FILE);
  console.log('Created post:', testPost);

  // Read - Get all posts
  const allPosts = await getAllPosts<Post>(DB_BLOG_POST_FILE);
  console.log('All posts:', allPosts);

  // Read - Get specific post
  const foundPost = await getPostByKey<Post>("1", DB_BLOG_POST_FILE);
  console.log('Found post:', foundPost);

  // Update - Modify post
  if (foundPost) {
    const k: Post = {key: "1"}

    await updatePost<Post>(k, DB_BLOG_POST_FILE);
    console.log('Post updated');
  }

  // Delete - Remove post
  const deleted = await deletePost("1", DB_BLOG_POST_FILE);
  console.log('Post deleted:', deleted);
}

// Execute main example
// crudTest().catch(console.error);
