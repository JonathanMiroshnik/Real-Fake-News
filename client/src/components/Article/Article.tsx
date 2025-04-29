import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import './Article.css'
import { ArticleContext } from '../../contexts/ArticlesContext';

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

  // function getValidatedArticleProps(props: ArticleProps) {
  //   return {
  //     title: props.title?.trim() || "Top Story",
  //     content: props.content || "This article is currently being generated...",
  //     author: props.author || "Artificial Intelligence Reporter",
  //     timestamp: props.timestamp instanceof Date ? props.timestamp : new Date(),
  //     // category: ['politics','tech','entertainment'].includes(props.category || '') 
  //     //   ? props.category 
  //     //   : 'general'
  //   };
  // }

  // const validated = getValidatedArticleProps(foundArticle);  

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
      <div className="article-content">
        <ReactMarkdown>{foundArticle.content}</ReactMarkdown>
      </div>
    </article>
  );
};

export default Article;