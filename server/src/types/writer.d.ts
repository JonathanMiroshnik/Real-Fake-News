import { Post } from "../lib/lowdb/lowdbOperations.js";

export interface Writer extends Post {
  name: string;
  description: string;
  systemPrompt: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}