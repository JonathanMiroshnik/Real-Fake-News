import { Post } from "../lib/database/sqliteOperations.js";

export interface Writer extends Post {
  name: string;
  description: string;
  systemPrompt: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}