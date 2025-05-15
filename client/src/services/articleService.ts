import { ArticleProps } from "../pages/ArticlePage/ArticlePage";

export type NewsCategory = {
    name: string; // Technical name of the News category
    text: string; // Additional name of the category
}

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

export async function pullRecentArticles() {
    // const route = "http://localhost:5001";
    // TODO: make this into global constant
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
    // const response = await fetch('/api/blogs/daily') // TODO: choose: OPTIONS: daily, hourly
    const articlesJSON = await response.json()
    let finalArticles = articlesJSON.articles;

    if (finalArticles.length < MIN_ACCEPTABLE_ARTICLES) {
        const response = await fetch(`${VITE_API_BASE}/api/blogs/by-minute?minute=${MAX_MINUTES_BEFORE_TO_CHECK}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const articlesJSON = await response.json()
        finalArticles = articlesJSON.articles;
    }

    return finalArticles;
}

export function articlesByCategory(articles: ArticleProps[], category: NewsCategory | string): ArticleProps[] {
    let currentCategory;
    if (typeof category !== "string") {
        currentCategory = category.name;
    }
    else {
        currentCategory = category;
    }

  const retArticles = articles.filter((article: ArticleProps) => {
    const mapCategory = article.category;
    if (mapCategory === undefined) return false;
    if (mapCategory.toString().toLowerCase() !== currentCategory.toLowerCase()) return false;
    return true;
  });

  return [...retArticles.map((ar) => ({...ar}))];
};

export function groupArticlesByCategories(articles: ArticleProps[], categories: NewsCategory[] = CATEGORIES) {
    const totalArticles: ArticleProps[][] = [];
    for (let ca of categories) {
        totalArticles.push(articlesByCategory(articles, ca.name));        
    }

    // console.log(totalArticles);

    return totalArticles;
}
