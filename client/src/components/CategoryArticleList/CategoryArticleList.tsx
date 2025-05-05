import { useContext } from "react";
import { ArticleContext } from "../../contexts/ArticlesContext";
import { NewsCategory } from "../../contexts/NewsConst";
// import ArticleListItem from "../ArticleListItem/ArticleListItem";
import { ArticleProps } from "../../pages/ArticlePage/ArticlePage";
import ArticleList from "../ArticleList/ArticleList";
import './CategoryArticleList.css'

/**
 * Category-specific article list component
 * @param category - NewsCategory filter for articles
 * - Automatically filters articles by category
 * - Uses context for article data
 * - Matches styling with ArticleList
 */
interface CategoryArticleListProps {
    /** Category filter configuration */
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
                    {/* <ul className="category-list-articles" >
                        {articlesbyCategory.map((article) => (
                            <li key={"article_category_list_item_" + article.key} className="list-article-text" >
                                <ArticleListItem article={article}/>
                            </li>
                        ))}
                    </ul> */}
                {/* </nav> */}
                <ArticleList articles={articlesbyCategory}/>
            </div>
            : null }
        </>
    );
}

export default CategoryArticleList;