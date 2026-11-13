import { Row } from '../lib/database/sqliteOperations.js';
import { NewsItem } from '../services/newsService.js';
import { Writer } from './writer';
import type { ContentSource } from './contentSource.js';

export interface ArticleScheme extends Row {
  title?: string;
  content?: string;
  author?: Writer;
  timestamp?: string;
  category?: string;
  headImage?: string;
  shortDescription?: string;
  originalNewsItem?: NewsItem;
  writerType?: 'AI' | 'Human' | 'Synthesis';
  isFeatured?: boolean;
  featuredDate?: string;
  contentSource?: ContentSource;
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
  writer?: string;
  afterDate: Date;
}

export interface BlogResponse {
  success: boolean;
  articles: ArticleScheme[];
  error?: string;
}

export interface RecipeScheme extends Row {
  title?: string;
  paragraphs?: string[];
  author?: Writer;
  timestamp?: string;
  category?: string;
  headImage?: string;
  images?: string[];
  shortDescription?: string;
  writerType?: 'AI' | 'Human' | 'Synthesis';
  contentSource?: ContentSource;
}
