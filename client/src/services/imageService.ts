import { ArticleProps, WriterProps } from "../pages/ArticlePage/ArticlePage";

const VITE_API_BASE="https://real.sensorcensor.xyz"  //"http://localhost:5001" 162.0.237.138
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
