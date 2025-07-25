import React from 'react';
import './NewsArticle.css';

function NewsArticle({ article, onBack }) {
  return (
    <div className="news-article-container">
      <button onClick={onBack} className="back-button">← Back to News</button>
      <h2>{article.title}</h2>
      <p className="article-date">{new Date(article.created_at).toLocaleString()}</p>
      <div className="article-content">
        {article.content}
      </div>
    </div>
  );
}

export default NewsArticle;
