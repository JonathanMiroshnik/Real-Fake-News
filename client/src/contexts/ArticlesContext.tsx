// TODO: create another state for the Featured Article that will be kept separate and chosen from the other articles.

import { useEffect, createContext, useState, ReactNode } from "react";
import { ArticleProps } from "../components/Article/Article";

interface ArticleContextType {
    articles: ArticleProps[];
}

export const ArticleContext = createContext<ArticleContextType>({articles: []});

function ArticleProvider({ children }: { children: ReactNode }) {
    const [articles, setArticles] = useState<ArticleProps[]>([]);

    useEffect(() => {
        async function fetchDailies() {
            const response = await fetch('http://localhost:5000/api/blogs/hourly') // daily
            const articlesJSON = await response.json()
            const finalArticles = articlesJSON.articles;
            
            setArticles([...finalArticles]);
        }
        
        fetchDailies();
    }, []);

  return (
    <ArticleContext.Provider value={{ articles: articles }}>
      {children}
    </ArticleContext.Provider>
  );
};

export default ArticleProvider;