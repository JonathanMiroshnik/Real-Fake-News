import { ArticleProps, WriterProps } from "../pages/ArticlePage/ArticlePage";
import { getApiBaseUrl } from "../config/apiConfig";

// The IP of the server is 162.0.237.138

// Get API base URL from config (uses VITE_BACKEND_DEV_MODE)
const VITE_API_BASE = getApiBaseUrl();
                    
export const DEFAULT_IMAGE="planet.jpg" // TODO: should this still be?

export function getImageURLFromArticle(article: ArticleProps, defaultImage: string = "") {
    return article?.headImage && article?.headImage !== ""
        ? `${VITE_API_BASE}/api/images/${encodeURIComponent(article.headImage)}`
        : defaultImage !== "" ? 
        `${VITE_API_BASE}/api/images/${encodeURIComponent(defaultImage)}`
        : "";
}

export function getImageURLFromWriter(writer: WriterProps, defaultImage: string = "") {
    return writer.profileImage && writer.profileImage !== ""
        ? `${VITE_API_BASE}/api/images/${encodeURIComponent(writer.profileImage)}`
        : defaultImage !== "" ? 
        `${VITE_API_BASE}/api/images/${encodeURIComponent(defaultImage)}`
        : "";
}

export function getImageURL(imageName: string) {
    return `${VITE_API_BASE}/api/images/${encodeURIComponent(imageName)}`;
}
