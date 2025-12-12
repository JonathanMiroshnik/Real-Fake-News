import { useContext, useEffect, useState } from 'react';
import ArticleList from '../../components/ArticleList/ArticleList';
import FeaturedArticle from '../../components/FeaturedArticle/FeaturedArticle';
import GamesList from '../../components/GamesList/GamesList';
import NewsCarousel from '../../components/NewsCarousel/NewsCarousel';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import HoroscopeSection from '../../components/Horoscope/HoroscopeSection/HoroscopeSection';
import RecipeSection from '../../components/RecipeSection/RecipeSection';
import { useResponsiveArticlesCount } from '../../hooks/useResponsiveArticlesCount';
import { ArticleContext } from '../../contexts/ArticlesContext';
import { groupArticlesByCategories, CATEGORIES } from '../../services/articleService';
import { getImageURLFromArticle, DEFAULT_IMAGE } from '../../services/imageService';
import { debugLog, debugWarn } from '../../utils/debugLogger';


// Temporary feature flag - remove when no longer needed
const SHOW_HOROSCOPES = import.meta.env.VITE_SHOW_HOROSCOPES === 'true';
const SHOW_RECIPES = import.meta.env.VITE_SHOW_RECIPES !== 'false';

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
  const [showNoArticlesMessage, setShowNoArticlesMessage] = useState(false);

  // Get delay from environment variable, default to 3000ms (3 seconds)
  const noArticlesMessageDelay = parseInt(
    import.meta.env.VITE_NO_ARTICLES_MESSAGE_DELAY || "3000",
    10
  );

  // Timer to delay showing "No articles loaded" message
  useEffect(() => {
    const timer = setTimeout(() => {
      if (articles.length === 0) {
        setShowNoArticlesMessage(true);
      }
    }, noArticlesMessageDelay);

    // Clear timer if articles load before timeout
    if (articles.length > 0) {
      setShowNoArticlesMessage(false);
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [articles.length]);

  // Debug: Show article count
  debugLog('🏠 [HomePage] Articles count:', articles.length);
  if (articles.length === 0 && showNoArticlesMessage) {
    debugWarn('⚠️ [HomePage] No articles loaded. Check browser console for API errors.');
  }

  debugLog('🏠 [HomePage] All articles:', articles.map(a => a.title));
  
  // Debug: Show category distribution
  debugLog('🏠 [HomePage] Category articles:', categoryArticles.map((cat, idx) => ({
    category: CATEGORIES[idx]?.name || 'Unknown',
    count: cat.length
  })));
  
  // Debug: Show all article categories
  const allCategories = [...new Set(articles.map(a => a.category).filter(Boolean))];
  debugLog('🏠 [HomePage] All article categories in data:', allCategories);

  // Preload featured article image for better LCP
  useEffect(() => {
    if (randomArticle) {
      const imageUrl = getImageURLFromArticle(randomArticle, DEFAULT_IMAGE);
      if (imageUrl) {
        // Remove any existing preload link
        const existingLink = document.querySelector('link[rel="preload"][as="image"][data-featured-image]');
        if (existingLink) {
          existingLink.remove();
        }
        
        // Create and add preload link
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = imageUrl;
        link.setAttribute('fetchpriority', 'high');
        link.setAttribute('data-featured-image', 'true');
        document.head.appendChild(link);
        
        return () => {
          // Cleanup on unmount
          const linkToRemove = document.querySelector('link[rel="preload"][as="image"][data-featured-image]');
          if (linkToRemove) {
            linkToRemove.remove();
          }
        };
      }
    }
  }, [randomArticle]);

  return (
    <div className="max-w-[1200px]">
      {articles.length === 0 && showNoArticlesMessage && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
          <p><strong>No articles loaded.</strong></p>
          <p>Check the browser console (F12) for errors.</p>
          <p>Make sure the server is running at http://localhost:5001 (development port)</p>
        </div>
      )}
      {/* TODO: magic number 4 */}
      <NewsCarousel maxItems={articlesPerSection >= 4 ? -1 : 0} />    
      <div className="w-full mb-12 last:mb-0">
        <SectionHeader topLine="Featured Article" bottomLine="Interest" />
        <div className='flex gap-4 pb-4 mb-8'>
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
            <div key={`category-section-${category.name}`} className="w-full mb-12 last:mb-0">
              <SectionHeader topLine={category.text} bottomLine={category.name} />
              <div className='flex gap-4 pb-4 mb-8'>
                <ArticleList articles={categoryArticleList} vertical={false} maxItems={articlesPerSection} />
              </div>
            </div>
          );
        }
        return null;
      })}
      
      {/* Fallback: If no articles in any category, show all articles */}
      {articles.length > 0 && categoryArticles.every(cat => cat.length === 0) && (
        <div className="w-full mb-12 last:mb-0">
          <SectionHeader topLine="All Articles" bottomLine="Latest News" />
          <div className='flex gap-4 pb-4 mb-8'>
            <ArticleList articles={articles} vertical={false} maxItems={articlesPerSection * 2} />
          </div>
        </div>
      )}
      
      <div className="w-full mb-12 last:mb-0">
        <SectionHeader topLine="Interactive" bottomLine="Games" />
        <div className='flex gap-4 pb-4 mb-8 justify-center'>
          <GamesList />
        </div>
      </div>

      {SHOW_HOROSCOPES && (
        <div className="w-full mb-12 last:mb-0">
          <HoroscopeSection />
        </div>
      )}

      {SHOW_RECIPES && (
        <div className="w-full mb-12 last:mb-0">
          <RecipeSection />
        </div>
      )}

        {/* <aside className="sidebar">
          <NewsCarousel/>
        </aside> */}
    </div>
  );
};

export default HomePage;