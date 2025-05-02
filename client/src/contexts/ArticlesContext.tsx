// TODO: create another state for the Featured Article that will be kept separate and chosen from the other articles.

import { useEffect, createContext, useState, ReactNode } from "react";
import { ArticleProps, WriterProps } from "../pages/ArticlePage/ArticlePage";

interface ArticleContextType {
    articles: ArticleProps[];
    writers: WriterProps[];
}

export const ArticleContext = createContext<ArticleContextType>({articles: [], writers: []});

function ArticleProvider({ children }: { children: ReactNode }) {
    const [articles, setArticles] = useState<ArticleProps[]>([]);
    const [writers, setWriters] = useState<WriterProps[]>([]);

    // TODO: should this be here or in a different "jobs" folder and just be imported from there?
    useEffect(() => {
        async function fetchDailies() {
            const response = await fetch('http://localhost:5000/api/blogs/daily') // TODO: choose: OPTIONS: daily, hourly
            const articlesJSON = await response.json()
            const finalArticles = articlesJSON.articles;

            setArticles([...finalArticles]);
        }
        
        fetchDailies();
    }, []);

    useEffect(() => {
      const articlesWithWriters = [...articles.filter((article) => {return article.author !== undefined})];
      let currentWriters: WriterProps[] = [];
      for (let article of articlesWithWriters) {
        if (article.author !== undefined) {
          currentWriters.push(article.author);
        }        
      }

      setWriters([...currentWriters.map((writer) => {return {...writer}})]);
    }, [articles]);

  return (
    <ArticleContext.Provider value={{ articles: articles, writers: writers }}>
      {children}
    </ArticleContext.Provider>
  );
};

export default ArticleProvider;