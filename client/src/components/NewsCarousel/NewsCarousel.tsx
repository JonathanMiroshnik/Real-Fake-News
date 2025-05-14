import { useContext } from 'react';
import AliceCarousel from 'react-alice-carousel';
import { ArticleContext } from '../../contexts/ArticlesContext';
import ArticleListItem from '../ArticleListItem/ArticleListItem';
import { ArticleProps } from '../../pages/ArticlePage/ArticlePage';
import { HOUR_MILLISECS } from '../../services/timeService';
import 'react-alice-carousel/lib/alice-carousel.css';

// The news ticker should present news from the last 4 hours~
const RECENT_ARTICLE_CUTOFF = HOUR_MILLISECS * 4;

interface NewsCarouselProps {
    maxItems?: number;
} 

// TODO: need specially made ArticleCarouselItem and make sure the size is precise for it.
// TODO: need to sort recent articles by timestamp
// TODO: after clicking on circles or arrows of carousel, stops automatic movement - Why?
/** 
 * @see {@link https://github.com/maxmarinich/react-alice-carousel | Origin Carousel component}
 */
function NewsCarousel({maxItems = -1}: NewsCarouselProps) {
    const articles = useContext(ArticleContext).articles;    

    const articlesbyCategory: ArticleProps[] = articles.filter((article) => {
        if (article.timestamp === undefined) {
            return false;
        }

        const millisecondsSincePublishing = new Date().getTime() - new Date(article.timestamp).getTime();
        const recentArticle: boolean = millisecondsSincePublishing <= RECENT_ARTICLE_CUTOFF;
        return recentArticle;
    });

    let items = [...articlesbyCategory.map((ar) => 
        // style={{width:"300px"}}
        <div key={"carousel_" + ar.key}> 
            <ArticleListItem article={ar} showUnderText={false} showImage={false}/>
        </div>
    )];

    if (maxItems === 0) {
        return null;
    }
    if (maxItems > 0) {
        items = items.splice(0, maxItems);
    }
    
    return items.length > 0 && <AliceCarousel 
        autoPlay={true} 
        autoPlayStrategy="all" 
        mouseTracking 
        items={items} 
        infinite={true}
        autoPlayInterval={3000}
        disableDotsControls={true}
        // responsive=      {{
        //     600: {
        //         items: 0,
        //     },
        //     1024: {
        //         items: 4,
        //     }
        //   }} 
        />;
}

export default NewsCarousel;