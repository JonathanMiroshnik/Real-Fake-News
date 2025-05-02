import CategoryArticleList from '../../components/CategoryArticleList/CategoryArticleList';
import { CATEGORIES } from '../../contexts/NewsConst';

function HomePage() {
  return (
    <div className="home-container">      
      <section className="featured-article">
        {/* <FeaturedArticle key="ee1b546d-05a4-478a-bee7-36ecda2de858"/> */}
      </section>
      
      <div className="main-content">
        {/* this was section */}
        <div className="article-grid">
          { CATEGORIES.map((category) => (
            <div key={"category_list_" + category.name}>
              <CategoryArticleList category={category}/>
            </div>
          )) }          
        </div>

        <aside className="sidebar">
          {/* Trending/news ticker */}
        </aside>
      </div>
    </div>
  );
};

export default HomePage;