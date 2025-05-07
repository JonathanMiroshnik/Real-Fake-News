import { Link } from 'react-router';
import { ArticleProps } from '../../pages/ArticlePage/ArticlePage';
import { DEFAULT_IMAGE, getImageURLFromArticle } from '../../services/imageService';
import { getLatestTime } from '../../services/timeService';
import './ArticleListItem.css'

/**
 * Individual article list item component
 * @param article - Article data to display
 * - Handles image loading and fallbacks
 * - Formats timestamps with timeService
 * - Implements article navigation
 */
interface ArticleListItemProps {
    /** Complete article data object */
    article: ArticleProps;
}

function ArticleListItem({article}: ArticleListItemProps) {
    return (
        <Link className="article-list-item-title" to={`/article/${article.key}`}>
            <div className="article-list-item">
                <div style={{textAlign: "center"}}>
                    <img className="article-list-item-head-image" 
                    src={getImageURLFromArticle(article, DEFAULT_IMAGE)} 
                    alt={article.title}/>     
                </div>
                <h3 className='article-list-item-title-header'>
                    {article.title}
                </h3>
                { article.shortDescription && <p className='article-list-item-description'>
                    {article.shortDescription}
                </p> }
                <div className="article-list-item-undertext">
                    { article.author?.name  +  " " + "|" + " " +
                        (article.timestamp ? 
                            getLatestTime(new Date().getTime() - new Date(article.timestamp).getTime()) 
                        : "")
                    } 
                </div>
            </div>
        </Link>
    );
}

export default ArticleListItem; 