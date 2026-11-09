import { Row } from '../lib/database/sqliteOperations.js';
import type { ContentSource } from './contentSource.js';

export interface Writer extends Row {
  name: string;
  description: string;
  systemPrompt: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
  contentSource?: ContentSource;
}
