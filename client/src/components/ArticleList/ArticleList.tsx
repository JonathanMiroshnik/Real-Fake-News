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
}

// const MAX_ITEMS: number = 4;

function ArticleList({title = "", articles, vertical = true, maxItems = 4}: ArticleListProps) {
    return (
        articles.length > 0 &&
        <div className="article-list-main">
            { title && <h2 className="article-list-title">{ title }</h2>}
            {/* <nav> */}
                <ul className="article-list-ul" style={{display: (vertical ? "flex": "blocks")}} >
                    { articles.slice(0, maxItems).map((ar) => (
                        <li key={"article_list_item_" + ar.key} >
                            <ArticleListItem article={ar}/>
                        </li>
                    )) }
                </ul>
            {/* </nav> */}
        </div>
    );
}

export default ArticleList;