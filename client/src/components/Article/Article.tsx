import React from 'react';
import ReactMarkdown from 'react-markdown';

import './Article.module.css'

export interface ArticleProps {
  title?: string;
  content?: string;
  author?: string;
  timestamp?: Date;
  category?: string;
  headImage?: string;
}

const getValidatedArticleProps = (props: ArticleProps) => {
  return {
    title: props.title?.trim() || "Top Story",
    content: props.content || "This article is currently being generated...",
    author: props.author || "Artificial Intelligence Reporter",
    timestamp: props.timestamp instanceof Date ? props.timestamp : new Date(),
    category: ['politics','tech','entertainment'].includes(props.category || '') 
      ? props.category 
      : 'general'
  };
}

export const Article: React.FC<ArticleProps> = (props) => {
  const validated = getValidatedArticleProps(props);

  return (
    <article className="news-article">
      <div className="article-header">
        <h2>{validated.title}</h2>
        <div className="article-meta">
          <span className="author">By {validated.author}</span>
          <span className="timestamp">{validated.timestamp.toLocaleDateString()}</span>
          <span className="category">{validated.category}</span>
        </div>
      </div>
      <div className="article-content">
        <ReactMarkdown>{validated.content}</ReactMarkdown>
      </div>
    </article>
  );
};
