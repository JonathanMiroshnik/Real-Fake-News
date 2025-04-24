import { Post } from "../lib/lowdb/lowdbOperations";

export interface Writer extends Post {
  name: string;
  description: string;
  systemPrompt: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}