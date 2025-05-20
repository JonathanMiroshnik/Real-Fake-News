import { useContext } from 'react';
import ArticleList from '../../components/ArticleList/ArticleList';
import FeaturedArticle from '../../components/FeaturedArticle/FeaturedArticle';
import GamesList from '../../components/GamesList/GamesList';
import NewsCarousel from '../../components/NewsCarousel/NewsCarousel';
import { useResponsiveArticlesCount } from '../../hooks/useResponsiveArticlesCount';
import { ArticleContext } from '../../contexts/ArticlesContext';
import { groupArticlesByCategories } from '../../services/articleService';

import './HomePage.css'

// /**
//  * Application homepage showing all news categories
//  * - Displays grid of category-specific article lists
//  * - Placeholder for featured article (TODO)
//  * - Responsive layout with main content and sidebar
//  */
function HomePage() {
  const articles = useContext(ArticleContext).articles;
  const articlesPerSection: number = useResponsiveArticlesCount();
  const randomArticle = articles[Math.floor(Math.random() * articles.length)];
  const categoryArticles = groupArticlesByCategories(articles);

  return (
    <div className="home-container">
      {/* TODO: magic number 4 */}
      <NewsCarousel maxItems={articlesPerSection >= 4 ? -1 : 0} />    
      <div className="home-section">
        <div className='home-section-content'>
          <div>
            {randomArticle && <FeaturedArticle article={randomArticle} />}
            {/* <CategoryArticleList category={CATEGORIES[0]}/> */}
            <div style={{display:"flex", justifyContent: "center"}}>
              <ArticleList articles={categoryArticles[0]} maxItems={articlesPerSection}/>
            </div>
          </div>
          {/* TODO: 4 magic number */}
          { articlesPerSection >= 4 && <ArticleList articles={categoryArticles[0]} maxItems={3} showImages={false} vertical={true}/> }
        </div>
      </div>
      
      {/* TODO: want to add titles to different sections of the home page */}
      {/* TODO: make CategoryArticleList pure, get articles from this level for it instead of inside the component */}

      {/* { CATEGORIES.map((category, ind) => (            
          categoryArticles[ind].length > 1 && 
            <div key={"category_list_" + category.name} className="home-section">
              <div className='home-section-content'>
                <ArticleList articles={categoryArticles[ind]} vertical={true} maxItems={articlesPerSection} />
              </div>
            </div>
      )) } */}

      <div className='home-section-content'>
          <ArticleList articles={categoryArticles[1]} vertical={false} maxItems={articlesPerSection} />
      </div>
      <div className='home-section-content'>
          <ArticleList articles={categoryArticles[2]} vertical={false} maxItems={articlesPerSection} />
      </div>
      
      <GamesList />        

        {/* <aside className="sidebar">
          <NewsCarousel/>
        </aside> */}
    </div>
  );
};

export default HomePage;