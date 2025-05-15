import { useContext } from 'react';
// import CategoryArticleList from '../../components/CategoryArticleList/CategoryArticleList';
import ArticleList from '../../components/ArticleList/ArticleList';
import FeaturedArticle from '../../components/FeaturedArticle/FeaturedArticle';
import { ArticleContext } from '../../contexts/ArticlesContext';
import { groupArticlesByCategories } from '../../services/articleService';
import GamesList from '../../components/GamesList/GamesList';
import './HomePage.css'
import { useResponsiveArticlesCount } from '../../hooks/useResponsiveArticlesCount';
import NewsCarousel from '../../components/NewsCarousel/NewsCarousel';


// /**
//  * Application homepage showing all news categories
//  * - Displays grid of category-specific article lists
//  * - Placeholder for featured article (TODO)
//  * - Responsive layout with main content and sidebar
//  */
// function HomePage() {
//   const articles = useContext(ArticleContext).articles;
//   const randomArticle = articles[Math.floor(Math.random() * articles.length)];

//   return (
//     <div className="home-container">
//       {/* <NewsCarousel/> */}
//       {randomArticle && <FeaturedArticle article={randomArticle} />}   
//       <div className="main-content">
//         {/* this was section */}
//         <div className="article-grid">        
//           { CATEGORIES.map((category) => (
//             // TODO: make CategoryArticleList pure, get articles from this level for it instead of inside the component
//             <div key={"category_list_" + category.name}>
//               <CategoryArticleList category={category}/>
//             </div>
//           )) }          
//         </div>

//         {/* <GamesList /> */}

//         {/* <aside className="sidebar">
//           <NewsCarousel/>
//         </aside> */}
//       </div>
//     </div>
//   );
// };


function HomePage() {
  const articles = useContext(ArticleContext).articles;
  const articlesPerSection: number = useResponsiveArticlesCount();
  const randomArticle = articles[Math.floor(Math.random() * articles.length)];

  const categoryArticles = groupArticlesByCategories(articles);

  return (
    <div className="home-container">
      <div>
      {/* style={{paddingBottom: "2rem", marginBottom: "4rem", borderBottom: "1px white solid"}} */}
        {/* TODO: magic number 4 */}
        <NewsCarousel maxItems={articlesPerSection >= 4 ? -1 : 0} />
      </div>        
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