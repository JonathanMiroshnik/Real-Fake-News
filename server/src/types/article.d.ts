import { Post, createPost, getAllPosts, getPostByKey, updatePost, deletePost } from "../lib/lowdb/lowdbOperations.js"
import { DB_BLOG_POST_FILE } from "../lib/lowdb/lowdb_databases.js";
import { NewsItem } from "../services/newsService.js";
import { Writer } from "./writer";

export interface ArticleScheme extends Post {
  title?: string;
  content?: string;
  author?: Writer;
  timestamp?: string;
  category?: string;
  headImage?: string;
  shortDescription?: string;
  originalNewsItem?: NewsItem;
}

export interface FeaturedArticleScheme extends ArticleScheme {
  title?: string;
  content?: ArticleScheme[];
  author?: Writer[];
  timestamp?: string;
  category?: string;
  headImage?: string;
  shortDescription?: string;
  originalNewsItem?: NewsItem;
}

export interface BlogRequest {
  writer: string = "";
  afterDate: Date;
}

export interface BlogResponse {
  success: boolean;
  articles: ArticleScheme[];
  error?: string;
}


// FOR TESTING PURPOSRS ----------------------------------------------------------------------------------

// const INITIAL_POSTS: ArticleScheme[] = [
//   {
//     key: "a1",
//     title: "The Rise of AI in Everyday Life",
//     content: "From voice assistants to self-driving cars, AI is transforming our daily routines...",
//     author: "Jane Doe",
//     timestamp: new Date("2025-03-01T09:00:00Z"),
//     category: "Technology",
//     headImage: "https://example.com/images/ai.jpg"
//   },
//   {
//     key: "a2",
//     title: "Top 10 Hidden Beaches in Europe",
//     author: "Luca Moretti",
//     timestamp: new Date("2025-02-14T17:30:00Z"),
//     category: "Travel"
//   },
//   {
//     key: "a3",
//     content: "Sometimes words speak louder without titles.",
//     author: "Mystery Writer",
//     timestamp: new Date(),
//     category: "Opinion"
//   },
//   {
//     key: "a4",
//     title: "🍞 How to Bake the Perfect Sourdough",
//     content: "Sourdough baking is both an art and a science. Here's how to master it...",
//     author: "Baker B.",
//     timestamp: new Date("2025-01-22T08:45:00Z"),
//     category: "Food",
//     headImage: "https://example.com/images/sourdough.jpg"
//   },
//   {
//     key: "a5",
//     title: "Understanding Quantum Entanglement",
//     timestamp: new Date("2025-04-10T12:00:00Z"),
//     category: "Science"
//   }
// ];

// export async function articleTest() {
//   // Initialize with test data
//   // const testPost: ArticleScheme = { key: "1", content: "hello maddy", author: "billy" };

//   for (const p of INITIAL_POSTS) {
//     // Create - Add new post
//     await createPost<ArticleScheme>(p, DB_BLOG_POST_FILE);
//     console.log('Created post:', p);

//     // Read - Get all posts
//     const allPosts = await getAllPosts<ArticleScheme>(DB_BLOG_POST_FILE);
//     console.log('All posts:', allPosts);

//     // Read - Get specific post
//     const foundPost = await getPostByKey<ArticleScheme>(p.key as string, DB_BLOG_POST_FILE);
//     console.log('Found post:', foundPost);

//     // Update - Modify post
//     if (foundPost) {
//       const k: ArticleScheme = { key: p.key, title: "hello" }

//       await updatePost<ArticleScheme>(k, DB_BLOG_POST_FILE);
//       console.log('Post updated');
//     }
//   }

//   // // Delete - Remove post
//   // const deleted = await deletePost("1", DB_BLOG_POST_FILE);
//   // console.log('Post deleted:', deleted);
// }