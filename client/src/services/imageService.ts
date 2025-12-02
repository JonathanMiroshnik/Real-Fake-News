import { ArticleProps, WriterProps } from "../pages/ArticlePage/ArticlePage";

// The IP of the server is 162.0.237.138

// TODO: make a constant file that contains this one
// Development backend runs on port 5001
let VITE_API_BASE: string = "";
if (import.meta.env.VITE_LOCAL_DEV_MODE === undefined) {
    VITE_API_BASE = "http://localhost:5001";
}
else {
    VITE_API_BASE = import.meta.env.VITE_LOCAL_DEV_MODE === "true" ? 
                "http://localhost:5001" : 
                "https://real.sensorcensor.xyz";
}
                    
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
