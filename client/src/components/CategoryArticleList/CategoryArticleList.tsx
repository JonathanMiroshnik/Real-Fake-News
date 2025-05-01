import { useContext } from "react";
import { ArticleProps } from "../Article/Article";
import { ArticleContext } from "../../contexts/ArticlesContext";
import { NewsCategory } from "../../contexts/NewsConst";
import ArticleListItem from "../ArticleListItem/ArticleListItem";

import './CategoryArticleList.css'

interface CategoryArticleListProps {
    category: NewsCategory;
}

function CategoryArticleList(props: CategoryArticleListProps) {
    const articles = useContext(ArticleContext).articles;    
    const articlesbyCategory: ArticleProps[] = articles.filter((article) => {
        return article.category === props.category.name
    });

    return (
        <>
    { articlesbyCategory.length > 0 ? 
    <div className="category-article-list-main">
        <h2 className="category-article-list-title">{ props.category.text }</h2>
        {/* <nav> */}
            <ul className="list-articles" >
                { articlesbyCategory.map((article) => (
                    <li key={article.key} className="list-article-text" >
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

export default CategoryArticleList;