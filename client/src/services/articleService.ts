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

export async function pullDailies() {
    // const route = "http://localhost:5001";
    const response = await fetch('/api/blogs/daily', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    // const response = await fetch('/api/blogs/daily') // TODO: choose: OPTIONS: daily, hourly
    const articlesJSON = await response.json()
    const finalArticles = articlesJSON.articles;

    return finalArticles;
}

export function articlesByCategory(articles: ArticleProps[], category: NewsCategory | string): ArticleProps[] {
    let currentCategory = "";
    if (typeof category !== "string") {
        currentCategory = category.name;
    }
    else {
        currentCategory = category;
    }

  const retArticles = articles.filter((article: ArticleProps) => {
    const mapCategory = article.category;
    if (mapCategory === undefined) return false;
    if (mapCategory !== category) return false;
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