import { Link } from "react-router";
import { ArticleProps } from "../../pages/ArticlePage/ArticlePage";
import { getImageURLFromArticle } from "../../services/imageService";
import { DEFAULT_IMAGE } from "../../services/imageService";
import './FeaturedArticle.css'

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
                            {/* TODO: dont like this way of gapping things */}
                            {" "}
                            <span className="timestamp">
                                { article.timestamp ? new Date(article.timestamp).toLocaleDateString() : null }
                            </span>
                        </div>
                    </div>
                    <img className="featured-article-image" src={getImageURLFromArticle(article, DEFAULT_IMAGE)} alt={article.title} />
                </section>
            </Link>
        </div>
    );
};

export default FeaturedArticle;