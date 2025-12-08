import { ArticleProps } from "../pages/ArticlePage/ArticlePage";
import { getApiBaseUrlWithPrefix } from "../config/apiConfig";
import { debugLog, debugError } from "../utils/debugLogger";

export type NewsCategory = {
    name: string; // Technical name of the News category
    text: string; // Additional name of the category
}

// TODO: need constants ts file
export const CATEGORIES: NewsCategory[] = [
    {
        name: "Politics",
        text: "Unreal Politics"
    },
    {
        name: "Sports",
        text: "Extraordinary Sports"
    },
    {
        name: "Culture",
        text: "Better Culture"
    },
    {
        name: "Economics",
        text: "The Real Economy"
    },
    {
        name: "Technology",
        text: "Technology/Magic Lite"
    },
    {
        name: "Food",
        text: "Food, Beyond"
    },
]; 

// One day
const MIN_MINUTES_BEFORE_TO_CHECK = 24 * 60;
// 4 days
const MAX_MINUTES_BEFORE_TO_CHECK = 24 * 60 * 4;
// 1 year (fallback to get all articles if needed)
const FALLBACK_MINUTES_BEFORE_TO_CHECK = 365 * 24 * 60;
const MIN_ACCEPTABLE_ARTICLES = 15;

/**
 * Helper function to fetch articles from the API
 */
async function fetchArticlesByMinutes(apiBase: string, minutes: number): Promise<ArticleProps[]> {
    const url = `${apiBase}/blogs/by-minute?minute=${minutes}`;
    debugLog('📡 [pullRecentArticles] Fetching from URL:', url);
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            debugError(`❌ [pullRecentArticles] Fetch failed: ${response.status} ${response.statusText}`);
            const errorText = await response.text().catch(() => 'No error details');
            debugError(`❌ [pullRecentArticles] Error response:`, errorText);
            return [];
        }

        const articlesJSON = await response.json();
        const articles = articlesJSON.articles || [];
        debugLog('📦 [pullRecentArticles] Fetched', articles.length, 'articles from', minutes, 'minutes window');
        
        if (articles.length > 0) {
            debugLog('📦 [pullRecentArticles] Sample article:', {
                key: articles[0].key,
                title: articles[0].title,
                timestamp: articles[0].timestamp
            });
        }
        
        return articles;
    } catch (error) {
        debugError('❌ [pullRecentArticles] Network error:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
            debugError('❌ [pullRecentArticles] Could not connect to server. Is it running at', apiBase, '?');
            debugError('❌ [pullRecentArticles] Note: Development backend runs on port 5001');
        }
        return [];
    }
}

/**
 * Sorts articles by timestamp (most recent first)
 */
function sortArticlesByDate(articles: ArticleProps[]): ArticleProps[] {
    return [...articles].sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return dateB - dateA; // Most recent first
    });
}

/**
 * Gets relevant articles from the server.
 * The server handles the fallback logic (24 hours -> 4 days -> 1 year).
 * @returns Array of articles, sorted by date (most recent first).
 */
export async function getRelevantArticles(): Promise<ArticleProps[]> {
    debugLog('🚀 [getRelevantArticles] Function called at:', new Date().toISOString());
    
    // Get API base URL from config (uses VITE_BACKEND_DEV_MODE)
    const VITE_API_BASE = getApiBaseUrlWithPrefix();
    debugLog('🔍 [getRelevantArticles] VITE_BACKEND_DEV_MODE:', import.meta.env.VITE_BACKEND_DEV_MODE, '→ API_BASE:', VITE_API_BASE);

    const url = `${VITE_API_BASE}/blogs/relevant`;
    debugLog('📡 [getRelevantArticles] Fetching from URL:', url);
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            debugError(`❌ [getRelevantArticles] Fetch failed: ${response.status} ${response.statusText}`);
            const errorText = await response.text().catch(() => 'No error details');
            debugError(`❌ [getRelevantArticles] Error response:`, errorText);
            return [];
        }

        const articlesJSON = await response.json();
        const articles = articlesJSON.articles || [];
        debugLog('📦 [getRelevantArticles] Fetched', articles.length, 'articles');
        
        if (articles.length > 0) {
            debugLog('📦 [getRelevantArticles] Sample article:', {
                key: articles[0].key,
                title: articles[0].title,
                timestamp: articles[0].timestamp
            });
        }
        
        debugLog('✅ [getRelevantArticles] Returning', articles.length, 'articles');
        return articles;
    } catch (error) {
        debugError('❌ [getRelevantArticles] Network error:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
            debugError('❌ [getRelevantArticles] Could not connect to server. Is it running at', VITE_API_BASE, '?');
            debugError('❌ [getRelevantArticles] Note: Development backend runs on port 5001');
        }
        return [];
    }
}

/**
 * @deprecated Use getRelevantArticles() instead. This function is kept for backwards compatibility.
 * Pulls recent articles, prioritizing recent articles. If there are no recent articles,
 * falls back to the next most recent articles available.
 * @returns Array of articles, sorted by date (most recent first).
 */
export async function pullRecentArticles() {
    debugLog('🚀 [pullRecentArticles] Function called at:', new Date().toISOString());
    debugLog('🚀 [pullRecentArticles] Stack trace:', new Error().stack);
    
    // Get API base URL from config (uses VITE_BACKEND_DEV_MODE)
    const VITE_API_BASE = getApiBaseUrlWithPrefix();
    debugLog('🔍 [pullRecentArticles] VITE_BACKEND_DEV_MODE:', import.meta.env.VITE_BACKEND_DEV_MODE, '→ API_BASE:', VITE_API_BASE);

    try {
        // Step 1: Try to get articles from the last 24 hours
        debugLog('📡 [pullRecentArticles] Step 1: Fetching articles from last 24 hours...');
        let finalArticles = await fetchArticlesByMinutes(VITE_API_BASE, MIN_MINUTES_BEFORE_TO_CHECK);

        // Step 2: If we have no articles, try the 4-day window
        // If we have some but not enough, also try the 4-day window to get more
        if (finalArticles.length === 0 || finalArticles.length < MIN_ACCEPTABLE_ARTICLES) {
            if (finalArticles.length === 0) {
                debugLog('📡 [pullRecentArticles] No articles found in last 24 hours, fetching from last 4 days...');
            } else {
                debugLog('📡 [pullRecentArticles] Not enough articles (' + finalArticles.length + ' < ' + MIN_ACCEPTABLE_ARTICLES + '), fetching from last 4 days...');
            }
            
            const extendedArticles = await fetchArticlesByMinutes(VITE_API_BASE, MAX_MINUTES_BEFORE_TO_CHECK);
            
            // If we got articles from the extended window, use them
            // This ensures we show something even if there are no recent articles
            if (extendedArticles.length > 0) {
                finalArticles = extendedArticles;
            }
        }

        // Step 3: If we still have no articles, fetch all articles and return the most recent ones
        if (finalArticles.length === 0) {
            debugLog('📡 [pullRecentArticles] Still no articles found, fetching all available articles...');
            const allArticles = await fetchArticlesByMinutes(VITE_API_BASE, FALLBACK_MINUTES_BEFORE_TO_CHECK);
            
            if (allArticles.length > 0) {
                // Sort by date and return the most recent ones
                const sortedArticles = sortArticlesByDate(allArticles);
                finalArticles = sortedArticles;
                debugLog('📦 [pullRecentArticles] Found', sortedArticles.length, 'total articles, returning most recent');
            }
        } else {
            // Sort the articles by date to ensure most recent first
            finalArticles = sortArticlesByDate(finalArticles);
        }

        debugLog('✅ [pullRecentArticles] Returning', finalArticles.length, 'articles');
        return finalArticles;
    } catch (error) {
        debugError('❌ [pullRecentArticles] Error caught:', error);
        debugError('❌ [pullRecentArticles] Error type:', error?.constructor?.name);
        debugError('❌ [pullRecentArticles] Error message:', error instanceof Error ? error.message : String(error));
        debugError('❌ [pullRecentArticles] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return [];
    }
}

/**
 * Filters the articles by the given News Category
 * @param articles Articles to filter from.
 * @param category Category that should be filtered for.
 * @returns Articles filtered by the given category.
 */
export function articlesByCategory(articles: ArticleProps[], category: NewsCategory | string): ArticleProps[] {
    let currentCategory;
    // Allows the category to be either a NewsCategory or a string
    if (typeof category !== "string") {
        currentCategory = category.name;
    }
    else {
        currentCategory = category;
    }

    // Filtering by category
    const retArticles = articles.filter((article: ArticleProps) => {
        const mapCategory = article.category;
        if (mapCategory === undefined) return false;
        if (mapCategory.toString().toLowerCase() !== currentCategory.toLowerCase()) return false;
        return true;
    });

    return [...retArticles.map((ar) => ({...ar}))];
};

/**
 * Groups the articles by the given categories.
 * @param articles List of Articles to filter
 * @param categories Categories to filter the articles by.
 * @returns A list of lists of articles, each sub-list filled with the articles of _that_ category.
 */
export function groupArticlesByCategories(articles: ArticleProps[], categories: NewsCategory[] = CATEGORIES) {
    const totalArticles: ArticleProps[][] = [];
    for (let ca of categories) {
        totalArticles.push(articlesByCategory(articles, ca.name));        
    }

    return totalArticles;
}
