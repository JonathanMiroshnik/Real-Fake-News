import { ArticleProps } from "../../pages/ArticlePage/ArticlePage";
import ArticleListItem from "../ArticleListItem/ArticleListItem";

import './ArticleList.css'

/**
 * Generic article list component with optional title
 * @param title - Optional section heading
 * @param articles - Array of articles to display
 * - Handles empty state automatically
 * - Uses standardized list styling
 */
interface ArticleListProps {
    /** Optional section heading text */
    title?: string;
    /** Array of articles to display */
    articles: ArticleProps[];
    /** Vertical or Horizontal list */
    vertical?: boolean;
    /** Maximum number of articles to be displayed */
    maxItems?: number;
    /** Controls whether images of articles are shown */
    showImages?: boolean;
}

function ArticleList({title = "", articles, vertical = false, maxItems = 4, showImages=true}: ArticleListProps) {
    return (
        articles.length > 0 &&
        <div className="article-list-main">
            { title && <h2 className="article-list-title">{ title }</h2>}
            
            {/* TODO: should we have a <nav> tag here, the <ul> inside it? */}
            <ul className={`article-list-ul article-list-ul-${vertical ? "vertical": "horizontal"}`} >
                { articles.slice(0, maxItems).map((ar) => (
                    <li key={"article_list_item_" + ar.key} >
                        <ArticleListItem showImage={showImages} article={ar}/>
                    </li>
                )) }
            </ul>
        </div>
    );
}

export default ArticleList;