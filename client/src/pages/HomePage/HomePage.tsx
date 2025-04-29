import { useContext } from 'react';
import { Link } from 'react-router-dom';

import styles from './HomePage.module.css';
import Article from '../../components/Article/Article';
import FeaturedArticle from '../../components/FeaturedArticle/FeaturedArticle';
import { ArticleContext } from '../../contexts/ArticlesContext';
import CategoryArticleList from '../../components/CategoryArticleList/CategoryArticleList';
import { CATEGORIES } from '../../contexts/NewsConst';

function HomePage() {
  return (
    <div className={styles.homeContainer}>      
      <section className="featured-article">
        {/* <FeaturedArticle key="ee1b546d-05a4-478a-bee7-36ecda2de858"/> */}
      </section>
      
      <div className="main-content">
        <section className={styles.articleGrid}>
          { CATEGORIES.map((category) => (
            <div key={category.name}>
              <CategoryArticleList category={category}/>
            </div>
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