import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import './Article.css'
import { ArticleContext } from '../../contexts/ArticlesContext';
import { DEFAULT_IMAGE, getImageURL } from '../../services/imageService';

export interface ArticleProps {
  key: string;
  title?: string;
  content?: string;
  author?: string;
  timestamp?: string;
  category?: string;
  headImage?: string;
}

function Article() {
  const { key } = useParams();
  const articles = useContext(ArticleContext).articles;
  const foundArticle = articles.find((article) => article.key === key);
  if (foundArticle === null || foundArticle === undefined) {
    return <div>ARTICLE NOT FOUND</div>;
  }

  let imageURL = getImageURL(foundArticle, DEFAULT_IMAGE);

  return (
    <article className="news-article">
      <div className="article-header">
        <h2>{ foundArticle?.title }</h2>
        <div className="article-meta">
          <span className="author">By { foundArticle?.author }</span>
          <span className="timestamp">{ foundArticle.timestamp ? new Date(foundArticle.timestamp).toLocaleDateString() : null }</span>
          <span className="category">{ foundArticle?.category }</span>
        </div>
      </div>

      {imageURL !== "" && (<img src={imageURL} alt={foundArticle.title} className="article-image" /> )}

      <div className="article-content">
        <ReactMarkdown>{foundArticle.content}</ReactMarkdown>
      </div>
    </article>
  );
};

export default Article;