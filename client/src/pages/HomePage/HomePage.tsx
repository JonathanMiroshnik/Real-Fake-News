import { useContext } from 'react';
import ArticleList from '../../components/ArticleList/ArticleList';
import FeaturedArticle from '../../components/FeaturedArticle/FeaturedArticle';
import GamesList from '../../components/GamesList/GamesList';
import NewsCarousel from '../../components/NewsCarousel/NewsCarousel';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { useResponsiveArticlesCount } from '../../hooks/useResponsiveArticlesCount';
import { ArticleContext } from '../../contexts/ArticlesContext';
import { groupArticlesByCategories, CATEGORIES } from '../../services/articleService';

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

  // Debug: Show article count
  console.log('🏠 [HomePage] Articles count:', articles.length);
  if (articles.length === 0) {
    console.warn('⚠️ [HomePage] No articles loaded. Check browser console for API errors.');
  }
  
  // Debug: Show category distribution
  console.log('🏠 [HomePage] Category articles:', categoryArticles.map((cat, idx) => ({
    category: CATEGORIES[idx]?.name || 'Unknown',
    count: cat.length
  })));
  
  // Debug: Show all article categories
  const allCategories = [...new Set(articles.map(a => a.category).filter(Boolean))];
  console.log('🏠 [HomePage] All article categories in data:', allCategories);

  return (
    <div className="home-container">
      {articles.length === 0 && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
          <p><strong>No articles loaded.</strong></p>
          <p>Check the browser console (F12) for errors.</p>
          <p>Make sure the server is running at http://localhost:5001 (development port)</p>
        </div>
      )}
      {/* TODO: magic number 4 */}
      <NewsCarousel maxItems={articlesPerSection >= 4 ? -1 : 0} />    
      <div className="home-section">
        <SectionHeader topLine="Featured Article" bottomLine="Interest" />
        <div className='home-section-content'>
          <div>
            {randomArticle && <FeaturedArticle article={randomArticle} />}
            {/* <CategoryArticleList category={CATEGORIES[0]}/> */}
            {/* Show Politics articles, or fallback to all articles if no category matches */}
            {categoryArticles[0] && categoryArticles[0].length > 0 ? (
              <div style={{display:"flex", justifyContent: "center"}}>
                <ArticleList articles={categoryArticles[0]} maxItems={articlesPerSection}/>
              </div>
            ) : articles.length > 0 ? (
              <div style={{display:"flex", justifyContent: "center"}}>
                <ArticleList articles={articles.slice(0, articlesPerSection)} maxItems={articlesPerSection}/>
              </div>
            ) : null}
          </div>
          {/* TODO: 4 magic number */}
          { articlesPerSection >= 4 && (
            categoryArticles[0] && categoryArticles[0].length > 0 ? (
              <ArticleList articles={categoryArticles[0]} maxItems={3} showImages={false} vertical={true}/>
            ) : articles.length > 0 ? (
              <ArticleList articles={articles.slice(0, 3)} maxItems={3} showImages={false} vertical={true}/>
            ) : null
          )}
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

      {/* Show all categories that have articles */}
      {CATEGORIES.map((category, index) => {
        const categoryArticleList = categoryArticles[index];
        if (categoryArticleList && categoryArticleList.length > 0) {
          return (
            <div key={`category-section-${category.name}`} className="home-section">
              <SectionHeader topLine={category.text} bottomLine={category.name} />
              <div className='home-section-content'>
                <ArticleList articles={categoryArticleList} vertical={false} maxItems={articlesPerSection} />
              </div>
            </div>
          );
        }
        return null;
      })}
      
      {/* Fallback: If no articles in any category, show all articles */}
      {articles.length > 0 && categoryArticles.every(cat => cat.length === 0) && (
        <div className="home-section">
          <SectionHeader topLine="All Articles" bottomLine="Latest News" />
          <div className='home-section-content'>
            <ArticleList articles={articles} vertical={false} maxItems={articlesPerSection * 2} />
          </div>
        </div>
      )}
      
      <div className="home-section">
        <SectionHeader topLine="Interactive" bottomLine="Games" />
        {/* <div className='home-section-content'> */}
        <GamesList />
        {/* </div> */}
      </div>        

        {/* <aside className="sidebar">
          <NewsCarousel/>
        </aside> */}
    </div>
  );
};

export default HomePage;