import { useParams } from 'react-router-dom';
import { CATEGORIES } from '../../contexts/NewsConst';
import CategoryArticleList from '../../components/CategoryArticleList/CategoryArticleList';
import './CategoryPage.css'

function CategoryPage() {
  const { key } = useParams();
  if (key === null || key === undefined) {
    return <div>CATEGORY INVALID</div>;
  }

  const currentCategory: string = key.toString();
  const foundCategory = CATEGORIES.find((cc) => {    
    return cc.name.toString().toLowerCase() === currentCategory.toString().toLowerCase();
    })
  if (foundCategory === null || foundCategory === undefined) {
    return <div>CATEGORY NOT FOUND</div>;
  }

  return (
    <div className="home-container">      
      <section className="featured-article">
        {/* <FeaturedArticle key="ee1b546d-05a4-478a-bee7-36ecda2de858"/> */}
      </section>
      
      <div className="main-content">
        {/* this was section */}
        <div className="article-grid">
            <CategoryArticleList category={foundCategory}/>          
        </div>

        <aside className="sidebar">
          {/* Trending/news ticker */}
        </aside>
      </div>
    </div>
  );
};

export default CategoryPage;