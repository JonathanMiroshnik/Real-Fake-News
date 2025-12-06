import { Link } from "react-router";
import { ArticleProps } from "../../pages/ArticlePage/ArticlePage";
import { getImageURLFromArticle } from "../../services/imageService";
import { DEFAULT_IMAGE } from "../../services/imageService";
import Image from "../Image/Image";

import './FeaturedArticle.css'

/**
 * Component to show Home page Featured articles
 * @param article - Article to be displayed as the featured article
 */
interface FeaturedArticleProps {
    /** Complete article data object */
    article: ArticleProps;
}

function FeaturedArticle({article}: FeaturedArticleProps) {
    return (
        <div>
            <Link to={`/article/${article.key}`} >
                <section className="featured-article">
                    <div className="featured-article-header">
                        <h2 className="featured-article-title">{ article.title }</h2>
                        {article.shortDescription && <p className="featured-article-description">
                            {article.shortDescription}
                        </p>}
                        <div className="featured-article-undertext">
                            <span className="author">By { article.author?.name }</span>
                            <span className="timestamp">
                                { article.timestamp ? new Date(article.timestamp).toLocaleDateString() : null }
                            </span>
                        </div>
                    </div>
                    <Image
                        src={getImageURLFromArticle(article, DEFAULT_IMAGE)}
                        alt={article.title}
                        className="featured-article-image"
                        aspectRatio="4/3"
                        placeholder={true}
                        objectFit="cover"
                    />
                </section>
            </Link>
        </div>
    );
};

export default FeaturedArticle;