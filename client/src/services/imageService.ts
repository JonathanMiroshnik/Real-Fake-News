import { ArticleProps } from "../components/Article/Article";

const VITE_API_BASE="http://localhost:5000"
export const DEFAULT_IMAGE="planet.jpg" // TODO: should this still be?

export function getImageURL(article: ArticleProps, defaultImage: string = "") {
    return article?.headImage && article?.headImage !== ""
        ? `${VITE_API_BASE}/api/images/${encodeURIComponent(article.headImage)}`
        : defaultImage !== "" ? 
        `${VITE_API_BASE}/api/images/${encodeURIComponent(defaultImage)}`
        : "";
}