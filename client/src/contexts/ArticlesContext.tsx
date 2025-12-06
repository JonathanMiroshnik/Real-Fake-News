// TODO: create another state for the Featured Article that will be kept separate and chosen from the other articles.

import { useEffect, createContext, useState, ReactNode } from "react";
import { getRelevantArticles } from "../services/articleService";
import { ArticleProps, WriterProps } from "../pages/ArticlePage/ArticlePage";
import { debugLog, debugWarn, debugError } from "../utils/debugLogger";

/**
   * Provides article data and writer information to consuming components
   * @property {ArticleProps[]} articles - List of available articles
   * @property {WriterProps[]} writers - Derived list of unique article authors
   */
interface ArticleContextType {
    articles: ArticleProps[];
    writers: WriterProps[];
}

// Context initialization with empty default values
export const ArticleContext = createContext<ArticleContextType>({articles: [], writers: []});

/**
  * ArticleProvider component
  * Manages article data fetching and author derivation
  * @param children - Child components consuming the context
  */
function ArticleProvider({ children }: { children: ReactNode }) {
    // Primary article state with empty initial value
  const [articles, setArticles] = useState<ArticleProps[]>([]);
  
  // Derived writer state extracted from articles
  const [writers, setWriters] = useState<WriterProps[]>([]);


  // TODO: should this be here or in a different "jobs" folder and just be imported from there?
  // Data fetching effect - runs once on mount
  useEffect(() => {    
      debugLog('🎯 [ArticlesContext] useEffect triggered at:', new Date().toISOString());
      debugLog('🎯 [ArticlesContext] Component mounted, starting article fetch...');
      
      async function fetchArticles() {
          try {
              debugLog('🎯 [ArticlesContext] fetchArticles() called at:', new Date().toISOString());
              debugLog('🎯 [ArticlesContext] Calling getRelevantArticles()...');
              
              let finalArticles = await getRelevantArticles();
              
              debugLog('🎯 [ArticlesContext] getRelevantArticles() returned:', finalArticles?.length || 0, 'articles');
              
              if (finalArticles === undefined) {
                debugWarn('⚠️ [ArticlesContext] finalArticles is undefined, setting to empty array');
                finalArticles = [];
              }

              debugLog('🎯 [ArticlesContext] Setting articles state with', finalArticles.length, 'articles');
              setArticles([...finalArticles]);
              debugLog('✅ [ArticlesContext] Articles state updated successfully');
          } catch (error) {
              debugError('❌ [ArticlesContext] Error in fetchArticles:', error);
              debugError('❌ [ArticlesContext] Error details:', error instanceof Error ? error.message : String(error));
              setArticles([]);
          }
      }
      
      fetchArticles();
  }, []);

  // Writer derivation effect - runs when articles change
  useEffect(() => {
    const articlesWithWriters = [...articles.filter((article) => {return article.author !== undefined})];
    let currentWriters: WriterProps[] = [];

    // Deduplicate authors while preserving object references
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
