import React, { useState, useEffect } from 'react';
import './NewsSidebar.css';

function NewsSidebar({ onSelectArticle }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/v1/news');
        const data = await response.json();
        if (response.ok) {
          setNews(data);
        } else {
          setError(data.msg);
        }
      } catch (err) {
        setError('Failed to fetch news.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <div>Loading news...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="news-sidebar-container">
      <h3>Latest News</h3>
      <ul className="news-list">
        {news.map(article => (
          <li key={article.id} onClick={() => onSelectArticle(article)}>
            <h4>{article.title}</h4>
            <p>{new Date(article.created_at).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NewsSidebar;
