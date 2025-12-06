import { useContext, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArticleContext } from '../../contexts/ArticlesContext';
import { ArticleProps } from '../../pages/ArticlePage/ArticlePage';
import { getImageURLFromArticle, DEFAULT_IMAGE } from '../../services/imageService';
import { pullRecentArticles } from '../../services/articleService';
import Image from '../Image/Image';
import './NewspaperPrintView.css';

/**
 * Newspaper print view component
 * Displays all articles in a newspaper-style layout for printing
 */
function NewspaperPrintView() {
  const contextArticles = useContext(ArticleContext).articles;
  const [articles, setArticles] = useState<ArticleProps[]>(contextArticles);
  const [isLoading, setIsLoading] = useState(contextArticles.length === 0);
  
  console.log('🖨️ [NewspaperPrintView] Context articles:', contextArticles.length);
  console.log('🖨️ [NewspaperPrintView] State articles:', articles.length);
  
  // Fetch articles if context is empty or update when context changes
  useEffect(() => {
    if (contextArticles.length > 0) {
      console.log('🖨️ [NewspaperPrintView] Using articles from context');
      setArticles(contextArticles);
      setIsLoading(false);
    } else {
      console.log('🖨️ [NewspaperPrintView] Context empty, fetching articles directly...');
      setIsLoading(true);
      pullRecentArticles()
        .then((fetchedArticles) => {
          console.log('🖨️ [NewspaperPrintView] Fetched', fetchedArticles.length, 'articles');
          console.log('🖨️ [NewspaperPrintView] Sample article:', fetchedArticles[0] ? {
            key: fetchedArticles[0].key,
            title: fetchedArticles[0].title,
            hasContent: !!fetchedArticles[0].content,
            hasShortDescription: !!fetchedArticles[0].shortDescription,
            contentLength: fetchedArticles[0].content?.length || 0
          } : 'No articles');
          setArticles(fetchedArticles);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('🖨️ [NewspaperPrintView] Error fetching articles:', error);
          setArticles([]);
          setIsLoading(false);
        });
    }
  }, [contextArticles]);
  
  // Sort articles by date (most recent first)
  const sortedArticles = [...articles].sort((a, b) => {
    const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return dateB - dateA;
  });

  // Get featured article (first one)
  const featuredArticle = sortedArticles[0];
  const otherArticles = sortedArticles.slice(1);

  // Split remaining articles into columns (3 columns)
  const articlesPerColumn = Math.ceil(otherArticles.length / 3);
  const column1 = otherArticles.slice(0, articlesPerColumn);
  const column2 = otherArticles.slice(articlesPerColumn, articlesPerColumn * 2);
  const column3 = otherArticles.slice(articlesPerColumn * 2);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="newspaper-container">
      {/* Masthead - Always show even if no articles */}
      <header className="newspaper-masthead">
        <h1 className="newspaper-title">Real Fake News</h1>
        <div className="newspaper-date">{currentDate}</div>
        <div className="newspaper-tagline">Satirical AI-generated content for the modern age</div>
      </header>
      
      {isLoading && (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading articles...</p>
        </div>
      )}
      
      {!isLoading && articles.length === 0 && (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>No articles available to display.</p>
        </div>
      )}

      {/* Featured Article */}
      {featuredArticle && (
        <article className="newspaper-featured-article">
          <div className="featured-article-header">
            <h2 className="featured-article-title">{featuredArticle.title}</h2>
            <div className="featured-article-meta">
              <span className="article-author">
                By {featuredArticle.author?.name || 'Anonymous'}
              </span>
              <span className="article-date">
                {featuredArticle.timestamp ? new Date(featuredArticle.timestamp).toLocaleDateString() : ''}
              </span>
              {featuredArticle.category && (
                <span className="article-category">{featuredArticle.category}</span>
              )}
            </div>
          </div>
          {featuredArticle.headImage && (
            <div className="featured-article-image-container">
              <Image
                src={getImageURLFromArticle(featuredArticle, DEFAULT_IMAGE)}
                alt={featuredArticle.title}
                className="featured-article-image"
                aspectRatio="16/9"
                placeholder={false}
                objectFit="contain"
              />
            </div>
          )}
          <div className="featured-article-content">
            {featuredArticle.content ? (
              <ReactMarkdown>{featuredArticle.content}</ReactMarkdown>
            ) : featuredArticle.shortDescription ? (
              <p>{featuredArticle.shortDescription}</p>
            ) : null}
          </div>
        </article>
      )}

      {/* Three Column Layout - Only show if we have articles */}
      {!isLoading && articles.length > 0 && (
        <div className="newspaper-columns">
          <div className="newspaper-column">
            {column1.map((article) => (
              <NewspaperArticle key={article.key} article={article} />
            ))}
          </div>
          <div className="newspaper-column">
            {column2.map((article) => (
              <NewspaperArticle key={article.key} article={article} />
            ))}
          </div>
          <div className="newspaper-column">
            {column3.map((article) => (
              <NewspaperArticle key={article.key} article={article} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual article component for newspaper columns
 */
function NewspaperArticle({ article }: { article: ArticleProps }) {
  const imageURL = getImageURLFromArticle(article, DEFAULT_IMAGE);

  return (
    <article className="newspaper-article">
      <h3 className="newspaper-article-title">{article.title}</h3>
      <div className="newspaper-article-meta">
        <span className="article-author">
          By {article.author?.name || 'Anonymous'}
        </span>
        <span className="article-date">
          {article.timestamp ? new Date(article.timestamp).toLocaleDateString() : ''}
        </span>
        {article.category && (
          <span className="article-category">{article.category}</span>
        )}
      </div>
      {imageURL && imageURL !== "" && (
        <div className="newspaper-article-image-container">
          <Image
            src={imageURL}
            alt={article.title}
            className="newspaper-article-image"
            aspectRatio="4/3"
            placeholder={false}
            objectFit="contain"
          />
        </div>
      )}
      <div className="newspaper-article-content">
        {article.content ? (
          <ReactMarkdown>{article.content}</ReactMarkdown>
        ) : article.shortDescription ? (
          <p>{article.shortDescription}</p>
        ) : null}
      </div>
    </article>
  );
}

export default NewspaperPrintView;

