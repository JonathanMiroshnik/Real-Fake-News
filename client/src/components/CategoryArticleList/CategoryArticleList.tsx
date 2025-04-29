import { Link } from "react-router";
import { ArticleProps } from "../Article/Article";
import { useContext } from "react";
import { ArticleContext } from "../../contexts/ArticlesContext";
import { NewsCategory } from "../../contexts/NewsConst";

import './CategoryArticleList.css'

interface CategoryArticleListProps {
    category: NewsCategory;
}

function CategoryArticleList(props: CategoryArticleListProps) {
    const articles = useContext(ArticleContext).articles;    
    const articlesbyCategory: ArticleProps[] = articles.filter((article) => {
        console.log("category compare", article.category, props.category);
        return article.category === props.category.name
    });

    console.log("ARTICLES BY CATEGORY", props.category.name, articlesbyCategory);

    return (
        <>
    { articlesbyCategory.length > 0 ? 
    <div className="category-article-list-main">
        <h2>{ props.category.text }</h2>
        <nav>
            <ul className="list-articles" >
                { articlesbyCategory.map((article) => (
                    <li key={article.key} className="list-article-text" >
                        <Link to={`/article/${article.key}`}>{article.title}</Link>
                        <div>
                            {article.author}
                        </div>
                    </li>
                )) }
            </ul>
        </nav>
    </div>
    : null }
    </>
    );
}

export default CategoryArticleList;