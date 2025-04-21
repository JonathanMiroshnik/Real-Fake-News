import React from "react"
import { Link } from "react-router";

import { ArticleProps } from "../Article/Article";

function FeaturedArticle({ 
    title,
    author,
    timestamp,
    headImage
  }: ArticleProps) {
    return (
        <Link to="">
            <div className="article-header">
                <h2>{title}</h2>
                <div className="article-meta">
                    <span className="author">By {author}</span>
                    <span className="timestamp">{timestamp.toLocaleDateString()}</span>
                </div>
            </div>

            <img src={headImage} />
        </Link>
    )
};

export default FeaturedArticle;