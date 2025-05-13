import { useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArticleContext } from '../../contexts/ArticlesContext';
import { DEFAULT_IMAGE, getImageURLFromArticle } from '../../services/imageService';
import { sanitizeWriterName } from '../../services/writerService';
import './ArticlePage.css'

export interface WriterProps {
  key: string;
  name: string;
  description: string;
  profileImage: string;
}

export interface ArticleProps {
  key: string;
  title?: string;
  content?: string;
  author?: WriterProps;
  timestamp?: string;
  category?: string;
  shortDescription?: string;
  headImage?: string;
}

function ArticlePage() {
  const { key } = useParams();
  const articles = useContext(ArticleContext).articles;
  const foundArticle = articles.find((article) => article.key === key);
  if (foundArticle === null || foundArticle === undefined) {
    return <div>ARTICLE NOT FOUND</div>;
  }

  let imageURL = getImageURLFromArticle(foundArticle, DEFAULT_IMAGE);  

  return (
    <article className="news-article">
      <div className="article-header">
        <h2 className="news-article-title-header">{ foundArticle?.title }</h2>
        <div className="article-meta">
          <div>
            {"By \t"}
            {foundArticle.author?.name ? 
              <Link className="article-list-item-writer" to={`/writer/${sanitizeWriterName(foundArticle.author?.name)}`}> 
                  <span className="author">{ foundArticle?.author?.name }</span>
              </Link>: null
            }
          </div>
            <span className="timestamp">{ foundArticle.timestamp ? new Date(foundArticle.timestamp).toLocaleDateString() : null }</span>
            <span className="category">{ foundArticle?.category }</span>
        </div>
      </div>
      
      <div className='article-page-head-image'>
        {imageURL !== "" && (<img src={imageURL} alt={foundArticle.title} className="article-image" /> )}
      </div>
      <div className="article-content">
        <ReactMarkdown>{foundArticle.content}</ReactMarkdown>
      </div>
    </article>
  );
};

export default ArticlePage;