import { Link } from 'react-router';
import { ArticleProps } from '../../pages/ArticlePage/ArticlePage';
import { DEFAULT_IMAGE, getImageURLFromArticle } from '../../services/imageService';
import { getLatestTime } from '../../services/timeService';
import Image from '../Image/Image';


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
        <Link className="no-underline group" to={`/article/${article.key}`}>
            <div className="max-h-[40rem] max-w-[40rem] text-left">
                {showImage && (
                    <Image
                        src={getImageURLFromArticle(article, DEFAULT_IMAGE)}
                        alt={article.title ?? 'Article'}
                        className="w-full mb-2 group-hover:brightness-110 transition-[filter]"
                        aspectRatio="16/9"
                        placeholder={true}
                        objectFit="cover"
                    />
                )}
                <h3 className='text-[var(--title-color)] text-[18px] m-[5px] p-0 group-hover:underline group-active:underline'>
                    {article.title}
                </h3>
                { article.shortDescription && showDescription && <p className='text-[var(--description-color)] text-[14px]'>
                    {article.shortDescription}
                </p> }
                {showUnderText && <div className="text-[var(--undertext-color)] text-[12px] text-center">
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