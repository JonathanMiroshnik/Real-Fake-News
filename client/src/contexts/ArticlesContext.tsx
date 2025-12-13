// TODO: create another state for the Featured Article that will be kept separate and chosen from the other articles.

import { useEffect, createContext, useState, useRef, useCallback, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { getRelevantArticles } from "../services/articleService";
import { ArticleProps, WriterProps } from "../pages/ArticlePage/ArticlePage";
import { debugLog, debugWarn, debugError } from "../utils/debugLogger";

// Session storage keys
const ARTICLES_STORAGE_KEY = 'articles_cache';
const ARTICLES_CACHE_TIMESTAMP_KEY = 'articles_cache_timestamp';

// Cache expiration time in milliseconds (default: 10 minutes)
const CACHE_EXPIRATION_MS = parseInt(
  import.meta.env.VITE_ARTICLES_CACHE_EXPIRATION_MS || '600000',
  10
); // 10 minutes default

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
    // Primary article state - initialize from sessionStorage if available
  const [articles, setArticles] = useState<ArticleProps[]>(() => {
    try {
      const cached = sessionStorage.getItem(ARTICLES_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        debugLog('🎯 [ArticlesContext] Loaded', parsed.length, 'articles from sessionStorage');
        return parsed;
      }
    } catch (error) {
      debugError('❌ [ArticlesContext] Error loading articles from sessionStorage:', error);
    }
    return [];
  });
  
  // Derived writer state extracted from articles
  const [writers, setWriters] = useState<WriterProps[]>([]);
  
  // Get current location to check if we're on an article/recipe page
  const location = useLocation();
  
  // Ref to track if we've already attempted to fetch (prevents multiple fetches)
  const fetchAttemptedRef = useRef(false);
  
  // Ref to track background refresh interval
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to check if cache is stale
  const isCacheStale = (): boolean => {
      const timestampStr = sessionStorage.getItem(ARTICLES_CACHE_TIMESTAMP_KEY);
      if (!timestampStr) return true;
      
      try {
          const timestamp = parseInt(timestampStr, 10);
          const now = Date.now();
          const age = now - timestamp;
          return age > CACHE_EXPIRATION_MS;
      } catch {
          return true;
      }
  };

  // Helper function to fetch articles from server (memoized with useCallback)
  const fetchArticlesFromServer = useCallback(async (isBackgroundRefresh = false): Promise<void> => {
      try {
          if (isBackgroundRefresh) {
              debugLog('🔄 [ArticlesContext] Background refresh: fetching fresh articles...');
          } else {
              debugLog('🎯 [ArticlesContext] fetchArticles() called at:', new Date().toISOString());
              debugLog('🎯 [ArticlesContext] Calling getRelevantArticles()...');
          }
          
          let finalArticles = await getRelevantArticles();
          
          debugLog('🎯 [ArticlesContext] getRelevantArticles() returned:', finalArticles?.length || 0, 'articles');
          
          if (finalArticles === undefined) {
            debugWarn('⚠️ [ArticlesContext] finalArticles is undefined, setting to empty array');
            finalArticles = [];
          }

          debugLog('🎯 [ArticlesContext] Setting articles state with', finalArticles.length, 'articles');
          setArticles([...finalArticles]);
          
          // Save to sessionStorage with timestamp
          try {
            sessionStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(finalArticles));
            sessionStorage.setItem(ARTICLES_CACHE_TIMESTAMP_KEY, Date.now().toString());
            if (isBackgroundRefresh) {
                debugLog('✅ [ArticlesContext] Articles refreshed in background and saved to sessionStorage');
            } else {
                debugLog('✅ [ArticlesContext] Articles saved to sessionStorage');
            }
          } catch (storageError) {
            debugWarn('⚠️ [ArticlesContext] Could not save articles to sessionStorage:', storageError);
          }
          
          debugLog('✅ [ArticlesContext] Articles state updated successfully');
      } catch (error) {
          debugError('❌ [ArticlesContext] Error in fetchArticles:', error);
          debugError('❌ [ArticlesContext] Error details:', error instanceof Error ? error.message : String(error));
          if (!isBackgroundRefresh) {
              setArticles([]);
          }
      }
  }, []); // Empty deps - setArticles is stable, getRelevantArticles is imported

  // TODO: should this be here or in a different "jobs" folder and just be imported from there?
  // Data fetching effect - runs once on mount, fetches only if not already in sessionStorage
  // and NOT on article/recipe pages. Also sets up background refresh if cache is stale.
  useEffect(() => {    
      // Prevent multiple fetch attempts
      if (fetchAttemptedRef.current) {
          return;
      }
      
      // SECOND: Skip fetching if we're on an article or recipe page (these pages fetch individual items)
      const isArticlePage = location.pathname.startsWith('/article/');
      const isRecipePage = location.pathname.startsWith('/recipe/');
      
      if (isArticlePage || isRecipePage) {
          debugLog('🎯 [ArticlesContext] Skipping fetch - on', isArticlePage ? 'article' : 'recipe', 'page:', location.pathname);
          debugLog('🎯 [ArticlesContext] Using', articles.length, 'articles from cache/context (if available)');
          fetchAttemptedRef.current = true;
          return;
      }
      
      // FIRST: Check if articles are already in sessionStorage
      const cachedArticles = sessionStorage.getItem(ARTICLES_STORAGE_KEY);
      const cacheTimestamp = sessionStorage.getItem(ARTICLES_CACHE_TIMESTAMP_KEY);
      
      if (cachedArticles && cacheTimestamp) {
          try {
              const parsed = JSON.parse(cachedArticles);
              if (parsed.length > 0) {
                  const stale = isCacheStale();
                  
                  if (stale) {
                      // Cache is stale - use cached articles immediately, but refresh in background
                      debugLog('🔄 [ArticlesContext] Cache is stale, using cached articles and refreshing in background');
                      debugLog('🎯 [ArticlesContext] Using', parsed.length, 'cached articles while fetching fresh ones...');
                      setArticles(parsed);
                      
                      // Fetch fresh articles in background
                      fetchArticlesFromServer(true);
                  } else {
                      // Cache is fresh - use it and skip API call
                      debugLog('🎯 [ArticlesContext] Using', parsed.length, 'fresh cached articles (skipping API call)');
                      if (articles.length !== parsed.length) {
                          setArticles(parsed);
                      }
                  }
                  
                  fetchAttemptedRef.current = true;
                  return;
              }
          } catch (error) {
              debugWarn('⚠️ [ArticlesContext] Error parsing cached articles, will fetch fresh:', error);
          }
      }
      
      // THIRD: If articles are already loaded in state (from initial state), check if stale
      if (articles.length > 0) {
          if (isCacheStale()) {
              debugLog('🔄 [ArticlesContext] Cache is stale, refreshing articles in background');
              fetchArticlesFromServer(true);
          } else {
              debugLog('🎯 [ArticlesContext] Using', articles.length, 'articles from initial state (skipping API call)');
          }
          fetchAttemptedRef.current = true;
          return;
      }
      
      // FOURTH: Only fetch if we have no cached articles and we're not on article/recipe pages
      // Mark that we're attempting to fetch
      fetchAttemptedRef.current = true;
      
      debugLog('🎯 [ArticlesContext] useEffect triggered at:', new Date().toISOString());
      debugLog('🎯 [ArticlesContext] No cached articles found, fetching from server...');
      
      fetchArticlesFromServer(false);
  }, []); // Empty dependency array - only run once on mount

  // Set up periodic background refresh when on pages that need articles
  useEffect(() => {
      const isArticlePage = location.pathname.startsWith('/article/');
      const isRecipePage = location.pathname.startsWith('/recipe/');
      
      // Don't set up refresh on article/recipe pages
      if (isArticlePage || isRecipePage) {
          return;
      }
      
      // Clear any existing interval
      if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
      }
      
      // Set up periodic refresh (check every 5 minutes)
      refreshIntervalRef.current = setInterval(() => {
          if (isCacheStale()) {
              debugLog('🔄 [ArticlesContext] Periodic check: cache is stale, refreshing...');
              fetchArticlesFromServer(true);
          } else {
              debugLog('✅ [ArticlesContext] Periodic check: cache is still fresh');
          }
      }, 5 * 60 * 1000); // Check every 5 minutes
      
      return () => {
          if (refreshIntervalRef.current) {
              clearInterval(refreshIntervalRef.current);
          }
      };
  }, [location.pathname, fetchArticlesFromServer]);

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
