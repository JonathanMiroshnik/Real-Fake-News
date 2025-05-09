import { useParams } from 'react-router-dom';
import { articlesByCategory, CATEGORIES } from '../../services/articleService';
// import CategoryArticleList from '../../components/CategoryArticleList/CategoryArticleList';
import './CategoryPage.css'
import ArticleList from '../../components/ArticleList/ArticleList';
import { useContext } from 'react';
import { ArticleContext } from '../../contexts/ArticlesContext';

function CategoryPage() {
  const { key } = useParams();
  if (key === null || key === undefined) {
    return <div>CATEGORY INVALID</div>;
  }

  const articles = useContext(ArticleContext).articles;

  const currentCategory: string = key.toString();
  const foundCategory = CATEGORIES.find((cc) => {    
    return cc.name.toString().toLowerCase() === currentCategory.toString().toLowerCase();
    })
  if (foundCategory === null || foundCategory === undefined) {
    return <div>CATEGORY NOT FOUND</div>;
  }

  const currentArticles = articlesByCategory(articles, foundCategory);

  return (
    <div className="home-container">      
      <section className="featured-article">
        {/* <FeaturedArticle key="ee1b546d-05a4-478a-bee7-36ecda2de858"/> */}
      </section>
      
      <div className="main-content">
        {/* this was section */}
        <div className="article-grid">
          <ArticleList articles={currentArticles}/>
            {/* <CategoryArticleList category={foundCategory}/>           */}
        </div>

        <aside className="sidebar">
          {/* Trending/news ticker */}
        </aside>
      </div>
    </div>
  );
};

export default CategoryPage;