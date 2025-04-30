import { Link } from "react-router";
import { ArticleProps } from "../Article/Article";

function FeaturedArticle({
    key, 
    title,
    author,
    timestamp,
    headImage
  }: ArticleProps) {
    return (
        <Link to={`/article/${key}`}>
            <div className="article-header">
                <h2>{title}</h2>
                <div className="article-meta">
                    <span className="author">By {author}</span>
                    <span className="timestamp">
                        { timestamp ? new Date(timestamp).toLocaleDateString() : null }
                    </span>
                </div>
            </div>

            <img src={headImage} />
        </Link>
    )
};

export default FeaturedArticle;