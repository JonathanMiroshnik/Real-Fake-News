import { useContext, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArticleContext } from '../../contexts/ArticlesContext';
import { DEFAULT_IMAGE, getImageURLFromArticle } from '../../services/imageService';
import { sanitizeWriterName } from '../../services/writerService';
import { getArticleByKey } from '../../services/articleService';
import Image from '../../components/Image/Image';
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
  const [foundArticle, setFoundArticle] = useState<ArticleProps | null | undefined>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!key) {
      setFoundArticle(undefined);
      setLoading(false);
      return;
    }

    // First, try to find article in context (from relevant articles)
    const articleFromContext = articles.find((article) => article.key === key);
    
    if (articleFromContext) {
      setFoundArticle(articleFromContext);
      setLoading(false);
      return;
    }

    // If not found in context, fetch from server
    async function fetchArticle() {
      setLoading(true);
      const article = await getArticleByKey(key);
      setFoundArticle(article || undefined);
      setLoading(false);
    }

    fetchArticle();
  }, [key, articles]);

  if (loading) {
    return <div>Loading article...</div>;
  }

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
      
      {imageURL !== "" && (
        <div className='article-page-head-image'>
          <Image
            src={imageURL}
            alt={foundArticle.title}
            className="article-image"
            aspectRatio="16/9"
            placeholder={true}
            objectFit="cover"
          />
        </div>
      )}
      <div className="article-content">
        <ReactMarkdown>{foundArticle.content}</ReactMarkdown>
      </div>
    </article>
  );
};

export default ArticlePage;