import { ArticleProps } from "../pages/ArticlePage/ArticlePage";

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
const MIN_ACCEPTABLE_ARTICLES = 15;

/**
 * Pulls recent articles, tries to grab only daily articles, if there aren't enough, pulls from the last 4 days.
 * @returns Array of articles.
 */
export async function pullRecentArticles() {
    console.log('🚀 [pullRecentArticles] Function called at:', new Date().toISOString());
    console.log('🚀 [pullRecentArticles] Stack trace:', new Error().stack);
    
    // TODO: make this into global constant
    // Differentiates between development and production mode URLs
    let VITE_API_BASE: string = "";
    if (import.meta.env.VITE_LOCAL_DEV_MODE === undefined) {
      VITE_API_BASE = "http://localhost:5000";
      console.log('🔍 [pullRecentArticles] VITE_LOCAL_DEV_MODE is undefined, using default:', VITE_API_BASE);
    }
    else {
      VITE_API_BASE = import.meta.env.VITE_LOCAL_DEV_MODE === "true" ? 
                    "http://localhost:5000" : 
                    "https://real.sensorcensor.xyz";
      console.log('🔍 [pullRecentArticles] VITE_LOCAL_DEV_MODE:', import.meta.env.VITE_LOCAL_DEV_MODE, '→ API_BASE:', VITE_API_BASE);
    }

    const url = `${VITE_API_BASE}/api/blogs/by-minute?minute=${MIN_MINUTES_BEFORE_TO_CHECK}`;
    console.log('🔍 [pullRecentArticles] Full URL:', url);
    console.log('🔍 [pullRecentArticles] Minutes to check:', MIN_MINUTES_BEFORE_TO_CHECK);

    try {
        const fetchStartTime = performance.now();
        console.log('📡 [pullRecentArticles] About to call fetch() at:', new Date().toISOString());
        console.log('📡 [pullRecentArticles] Fetch options:', {
            method: 'GET',
            url: url,
            headers: { 'Content-Type': 'application/json' }
        });
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const fetchEndTime = performance.now();
        console.log('📡 [pullRecentArticles] Fetch completed in', (fetchEndTime - fetchStartTime).toFixed(2), 'ms');
        console.log('📡 [pullRecentArticles] Response status:', response.status, response.statusText);
        console.log('📡 [pullRecentArticles] Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            console.error(`Failed to fetch articles: ${response.status} ${response.statusText}`);
            return [];
        }

        console.log('📦 [pullRecentArticles] Parsing JSON response...');
        const articlesJSON = await response.json();
        console.log('📦 [pullRecentArticles] Response data:', articlesJSON);
        let finalArticles = articlesJSON.articles || [];
        console.log('📦 [pullRecentArticles] Articles count:', finalArticles.length);

        // TODO: don't like the two checks for number of articles, should be more generalized.
        if (finalArticles.length < MIN_ACCEPTABLE_ARTICLES) {
            console.log('📡 [pullRecentArticles] Not enough articles (' + finalArticles.length + ' < ' + MIN_ACCEPTABLE_ARTICLES + '), fetching from last 4 days...');
            const secondUrl = `${VITE_API_BASE}/api/blogs/by-minute?minute=${MAX_MINUTES_BEFORE_TO_CHECK}`;
            console.log('📡 [pullRecentArticles] Second fetch URL:', secondUrl);
            
            const secondFetchStart = performance.now();
            const response = await fetch(secondUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const secondFetchEnd = performance.now();
            console.log('📡 [pullRecentArticles] Second fetch completed in', (secondFetchEnd - secondFetchStart).toFixed(2), 'ms');

            if (response.ok) {
                const articlesJSON = await response.json();
                finalArticles = articlesJSON.articles || [];
                console.log('📦 [pullRecentArticles] Extended articles count:', finalArticles.length);
            } else {
                console.error('❌ [pullRecentArticles] Second fetch failed:', response.status, response.statusText);
            }
        }

        console.log('✅ [pullRecentArticles] Returning', finalArticles.length, 'articles');
        return finalArticles;
    } catch (error) {
        console.error('❌ [pullRecentArticles] Error caught:', error);
        console.error('❌ [pullRecentArticles] Error type:', error?.constructor?.name);
        console.error('❌ [pullRecentArticles] Error message:', error instanceof Error ? error.message : String(error));
        console.error('❌ [pullRecentArticles] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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
