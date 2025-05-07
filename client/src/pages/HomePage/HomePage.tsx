import { useContext } from 'react';
import CategoryArticleList from '../../components/CategoryArticleList/CategoryArticleList';
import FeaturedArticle from '../../components/FeaturedArticle/FeaturedArticle';
import { ArticleContext } from '../../contexts/ArticlesContext';
import { CATEGORIES } from '../../contexts/NewsConst';
import GamesList from '../../components/GamesList/GamesList';
import './HomePage.css'
import NewsCarousel from '../../components/NewsCarousel/NewsCarousel';


/**
 * Application homepage showing all news categories
 * - Displays grid of category-specific article lists
 * - Placeholder for featured article (TODO)
 * - Responsive layout with main content and sidebar
 */
function HomePage() {
  const articles = useContext(ArticleContext).articles;
  const randomArticle = articles[Math.floor(Math.random() * articles.length)];

  return (
    <div className="home-container">
      <NewsCarousel/>
      {randomArticle && <FeaturedArticle article={randomArticle} />}   
      <div className="main-content">
        {/* this was section */}
        <div className="article-grid">        
          { CATEGORIES.map((category) => (
            <div key={"category_list_" + category.name}>
              <CategoryArticleList category={category}/>
            </div>
          )) }          
        </div>

        <GamesList />

        <aside className="sidebar">
          {/* Trending/news ticker */}
        </aside>
      </div>
    </div>
  );
};

export default HomePage;