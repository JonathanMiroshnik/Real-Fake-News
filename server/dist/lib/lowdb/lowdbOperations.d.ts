export { createPost, getAllPosts, getPostByKey, updatePost, deletePost } from '../database/sqliteOperations.js';
export interface Post {
    key: string | undefined;
}
