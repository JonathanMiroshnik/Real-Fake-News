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
    // TODO: make this into global constant
    // Differentiates between development and production mode URLs
    let VITE_API_BASE: string = "";
    if (import.meta.env.VITE_LOCAL_DEV_MODE === undefined) {
      VITE_API_BASE = "http://localhost:5001";
    }
    else {
      VITE_API_BASE = import.meta.env.VITE_LOCAL_DEV_MODE === "true" ? 
                    "http://localhost:5001" : 
                    "https://real.sensorcensor.xyz";
    }

    const response = await fetch(`${VITE_API_BASE}/api/blogs/by-minute?minute=${MIN_MINUTES_BEFORE_TO_CHECK}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    const articlesJSON = await response.json();
    let finalArticles = articlesJSON.articles;

    // TODO: don't like the two checks for number of articles, should be more generalized.
    if (finalArticles.length < MIN_ACCEPTABLE_ARTICLES) {
        const response = await fetch(`${VITE_API_BASE}/api/blogs/by-minute?minute=${MAX_MINUTES_BEFORE_TO_CHECK}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const articlesJSON = await response.json();
        finalArticles = articlesJSON.articles;
    }

    return finalArticles;
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
