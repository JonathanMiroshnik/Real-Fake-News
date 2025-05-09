import { useContext } from "react";
import { ArticleContext } from "../../contexts/ArticlesContext";
import { NewsCategory } from "../../services/articleService";
import { ArticleProps } from "../../pages/ArticlePage/ArticlePage";
import ArticleList from "../ArticleList/ArticleList";
import './CategoryArticleList.css'

// TODO: maybe this component is irrelevant and should just be replaced entirely with ArticleList?

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

    vertical?: boolean; // TODO: delete
}

function CategoryArticleList(props: CategoryArticleListProps) {
    const articles = useContext(ArticleContext).articles;
    const articlesbyCategory: ArticleProps[] = articles.filter((article) => {
        return article.category === props.category.name
    });    

    return (
        articlesbyCategory.length > 0 &&
        <div className="category-article-list-main">
            <h2 className="category-article-list-title">{ props.category.text }</h2>
            <ArticleList vertical={props?.vertical} articles={articlesbyCategory}/>
        </div>
    );
}

export default CategoryArticleList;