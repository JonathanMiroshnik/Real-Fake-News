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
    /** Controls whether the head image of the article is shown */
    showImage?: boolean;
    /** Controls whether you see the description */
    showDescription?: boolean;
    /** Controls whether you see the undertext */
    showUnderText?: boolean;
}

function ArticleListItem({article, showImage=true, showDescription=true, showUnderText=true}: ArticleListItemProps) {
    return (
        <Link className="article-list-item-title" to={`/article/${article.key}`}>
            <div className="article-list-item">
                {showImage && <div style={{textAlign: "center"}}>
                    <img className="article-list-item-head-image" 
                    src={getImageURLFromArticle(article, DEFAULT_IMAGE)} 
                    alt={article.title}/>     
                </div>}
                <h3 className='article-list-item-title-header'>
                    {article.title}
                </h3>
                { article.shortDescription && showDescription && <p className='article-list-item-description'>
                    {article.shortDescription}
                </p> }
                {showUnderText && <div className="article-list-item-undertext">
                    { article.author?.name + " | " +
                        (article.timestamp ? 
                            getLatestTime(new Date().getTime() - new Date(article.timestamp).getTime()) 
                        : "")
                    } 
                </div>}
            </div>
        </Link>
    );
}

export default ArticleListItem; 