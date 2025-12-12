import { ArticleProps, WriterProps } from "../pages/ArticlePage/ArticlePage";
import { RecipeProps } from "../types/recipe";
import { getApiBaseUrlWithPrefix } from "../config/apiConfig";

// Get API base URL from config (uses VITE_BACKEND_DEV_MODE)
const VITE_API_BASE = getApiBaseUrlWithPrefix();
                    
export const DEFAULT_IMAGE="planet.jpg" // TODO: should this still be?

export function getImageURLFromArticle(article: ArticleProps, defaultImage: string = "") {
    return article?.headImage && article?.headImage !== ""
        ? `${VITE_API_BASE}/images/${encodeURIComponent(article.headImage)}`
        : defaultImage !== "" ? 
        `${VITE_API_BASE}/images/${encodeURIComponent(defaultImage)}`
        : "";
}

export function getImageURLFromWriter(writer: WriterProps, defaultImage: string = "") {
    return writer.profileImage && writer.profileImage !== ""
        ? `${VITE_API_BASE}/images/${encodeURIComponent(writer.profileImage)}`
        : defaultImage !== "" ? 
        `${VITE_API_BASE}/images/${encodeURIComponent(defaultImage)}`
        : "";
}

export function getImageURL(imageName: string) {
    return `${VITE_API_BASE}/images/${encodeURIComponent(imageName)}`;
}

export function getImageURLFromRecipe(recipe: RecipeProps, defaultImage: string = "") {
    return recipe?.headImage && recipe?.headImage !== ""
        ? `${VITE_API_BASE}/images/${encodeURIComponent(recipe.headImage)}`
        : defaultImage !== "" ? 
        `${VITE_API_BASE}/images/${encodeURIComponent(defaultImage)}`
        : "";
}
