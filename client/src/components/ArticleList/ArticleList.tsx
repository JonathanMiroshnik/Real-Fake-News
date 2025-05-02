import { ArticleProps } from "../../pages/ArticlePage/ArticlePage";
import ArticleListItem from "../ArticleListItem/ArticleListItem";

import './ArticleList.css'

interface ArticleListProps {
    title?: string;
    articles: ArticleProps[];
}

function ArticleList(props: ArticleListProps) {
    return (
        <>
            { props.articles.length > 0 ? 
            <div className="-article-list-main">
                {props.title && <h2 className="-article-list-title">{ props.title }</h2>}
                {/* <nav> */}
                    <ul className="list-articles" >
                        { props.articles.map((article) => (
                            <li key={"article_list_item_" + article.key} className="list-article-text" >
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