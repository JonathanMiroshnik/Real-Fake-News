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
}

const MAX_ITEMS: number = 4;

function ArticleList(props: ArticleListProps) {
    return (
        <>
            { props.articles.length > 0 ? 
            <div className="article-list-main">
                {props.title && <h2 className="article-list-title">{ props.title }</h2>}
                {/* <nav> */}
                    <ul className="article-list-ul" >
                        { props.articles.slice(0, MAX_ITEMS).map((article) => (
                            <li key={"article_list_item_" + article.key} >
                                <ArticleListItem article={article}/>
                            </li>
                        )) }
                    </ul>
                {/* </nav> */}
            </div>
            : null }
        </>
    );
}

export default ArticleList;