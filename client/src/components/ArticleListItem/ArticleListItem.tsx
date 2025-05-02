import { Link } from 'react-router';
import { ArticleProps } from '../../pages/ArticlePage/ArticlePage';
import { DEFAULT_IMAGE, getImageURLFromArticle } from '../../services/imageService';
import { getLatestTime } from '../../services/timeService';
import './ArticleListItem.css'

interface ArticleListItemProps {
  article: ArticleProps;
}

function ArticleListItem({article}: ArticleListItemProps) {
    return (
        <Link className="article-list-item-title" to={`/article/${article.key}`}>
            <div className="article-list-item">
                <div style={{textAlign: "center"}}>
                    <img src={getImageURLFromArticle(article, DEFAULT_IMAGE)} 
                    alt={article.title} className="article-list-item-head-image"/>                 
                </div>
                <h3 className='article-list-item-title-header'>
                    {article.title}
                </h3>
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