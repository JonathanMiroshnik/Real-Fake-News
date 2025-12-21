import { useContext, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import { ArticleContext } from '../../contexts/ArticlesContext';
import { DEFAULT_IMAGE, getImageURLFromArticle } from '../../services/imageService';
import { sanitizeWriterName } from '../../services/writerService';
import { getArticleByKey } from '../../services/articleService';
import Image from '../../components/Image/Image';

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
      const article = await getArticleByKey(key ?? '');
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
    <article className="max-w-[50%] rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] mt-4 p-8 relative before:content-[''] before:h-full before:w-1 before:absolute before:left-0 before:top-0 max-sm:max-w-[90%] max-sm:p-4">
      <div className="article-header">
        <h2 className="text-[color:var(--title-color)] m-1 p-0">{ foundArticle?.title }</h2>
        <div className="flex justify-center gap-4 mb-6 text-sm text-[color:var(--undertext-color)] text-center">
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
        <div className='flex justify-center mb-6'>
          <Image
            src={imageURL}
            alt={foundArticle.title ?? 'Article'}
            className="w-full max-w-[800px]"
            aspectRatio="16/9"
            placeholder={true}
            objectFit="cover"
          />
        </div>
      )}
      <div className="article-content leading-relaxed text-[1.3rem] text-left text-[color:var(--title-color)] max-sm:text-[1rem]">
        <div className="[&_p]:mt-0 [&_p]:mb-6 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_h3]:mt-6 [&_h3]:text-[#cc0000]">
          <Markdown>{foundArticle.content}</Markdown>
        </div>
      </div>
    </article>
  );
};

export default ArticlePage;
