import { Link } from 'react-router';
import { ArticleProps } from '../Article/Article';
import { DEFAULT_IMAGE, getImageURL } from '../../services/imageService';
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
                    <img src={getImageURL(article, DEFAULT_IMAGE)} 
                    alt={article.title} className="article-list-item-head-image"/>                 
                </div>
                <h3 className='article-list-item-title-header'>
                    {article.title}
                </h3>
                <div className="article-list-item-undertext">
                    { article.author +  " " + "|" + " " + 
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