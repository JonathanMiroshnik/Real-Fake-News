import { createContext } from 'react';
import { ArticleProps, WriterProps } from '../pages/ArticlePage/ArticlePage';

interface ArticleContextType {
  articles: ArticleProps[];
  writers: WriterProps[];
}

export const ArticleContext = createContext<ArticleContextType>({
  articles: [],
  writers: [],
});
