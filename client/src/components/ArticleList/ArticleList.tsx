import { ArticleProps } from "../../pages/ArticlePage/ArticlePage";
import ArticleListItem from "../ArticleListItem/ArticleListItem";


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
        <div className="flex">
            { title && <h2 className="text-[var(--title-color)]">{ title }</h2>}
            
            {/* TODO: should we have a <nav> tag here, the <ul> inside it? */}
            <ul className={`gap-8 p-0 m-0 list-none ${vertical ? "inline-block" : "flex"}`} >
                { articles.slice(0, maxItems).map((ar, index) => (
                    <li key={"article_list_item_" + ar.key} className={`m-0 ${vertical && index > 0 ? "border-t border-gray" : ""}`}>
                        <ArticleListItem showImage={showImages} article={ar}/>
                    </li>
                )) }
            </ul>
        </div>
    );
}

export default ArticleList;