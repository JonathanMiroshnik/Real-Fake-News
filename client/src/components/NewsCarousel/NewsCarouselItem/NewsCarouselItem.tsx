import './NewsCarouselItem.css'

import { Link } from 'react-router';
import { ArticleProps } from '../../../pages/ArticlePage/ArticlePage';
// import { DEFAULT_IMAGE, getImageURLFromArticle } from '../../services/imageService';
import { getLatestTime } from '../../../services/timeService';
import './ArticleListItem.css'

/**
 * Individual article list item component
 * @param article - Article data to display
 * - Handles image loading and fallbacks
 * - Formats timestamps with timeService
 * - Implements article navigation
 */
interface NewsCarouselItemProps {
    /** Complete article data object */
    article: ArticleProps;
}

function NewsCarouselItem({article}: NewsCarouselItemProps) {
    return <Link to={`/article/${article.key}`}>
            <div className="news-carousel-item">
                <h3 className='news-carousel-item-title'>
                    {article.title}
                </h3>
                <div className="news-carousel-item-undertext">
                    { article.author?.name  +  " " + "|" + " " +
                        (article.timestamp ? 
                            getLatestTime(new Date().getTime() - new Date(article?.timestamp).getTime()) 
                        : "")
                    } 
                </div>
            </div>
        </Link>;
}

export default NewsCarouselItem;