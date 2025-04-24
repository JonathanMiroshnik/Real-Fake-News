import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { ArticleProps } from '../../components/Article/Article';

import styles from './HomePage.module.css';
import Article from '../../components/Article/Article';

function HomePage() {
  const [articles, setArticles] = useState<ArticleProps[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/blogs/daily')
      .then(response => response.json())
      .then(data => setArticles(data.articles))
      .catch(error => console.error('Error:', error));
  }, []);

  return (
    <div className={styles.homeContainer}>

      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/users">Users</Link>
          </li>
        </ul>
      </nav>

      <section className="featured-article">
        {/* Featured article component */}
      </section>
      
      <div className="main-content">
        <section className={styles.articleGrid}>
          { articles.length > 0 && articles.map((article) => (
            <Article {...article} />
          )) }
        </section>

        <aside className={styles.sidebar}>
          {/* Trending/news ticker */}
        </aside>
      </div>
    </div>
  );
};

export default HomePage;