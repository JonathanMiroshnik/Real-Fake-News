import { Link } from 'react-router-dom';

import styles from './HomePage.module.css';
import Article from '../../components/Article/Article';

function HomePage() {
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
          hello
        </section>

        <aside className={styles.sidebar}>
          {/* Trending/news ticker */}
        </aside>
      </div>
    </div>
  );
};

export default HomePage;