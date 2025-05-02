import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ArticleContext } from '../../contexts/ArticlesContext';
import { ArticleProps } from '../ArticlePage/ArticlePage';
import ArticleList from '../../components/ArticleList/ArticleList';
import { desanitizeWriterName } from '../../services/writerService';
import { getImageURLFromWriter } from '../../services/imageService';
import { DEFAULT_IMAGE } from '../../services/imageService';
import './WriterPage.css'

function WriterPage() {
  const { key } = useParams();
  if (key === null || key === undefined) {
    return <div>WRITER INVALID</div>;
  }

  const desenitizedKey = desanitizeWriterName(key);

  const currentWriters = useContext(ArticleContext).writers; 
  const foundWriter = currentWriters.find((writer) => writer.name === desenitizedKey);
  if (foundWriter === null || foundWriter === undefined) {
    return <div>WRITER NOT FOUND</div>;
  }

  const currentArticles = useContext(ArticleContext).articles;    
  const articlesbyWriter: ArticleProps[] = currentArticles.filter((article) => {
        if (article.author === undefined) {
            return false;
        }
        return article.author?.name === desenitizedKey;
  });  

  return (
    <div className="home-container">      
      <section className="featured-article">
        {/* <FeaturedArticle key="ee1b546d-05a4-478a-bee7-36ecda2de858"/> */}
      </section>

      <div style={{textAlign: "center"}}>
            <img src={getImageURLFromWriter(foundWriter, DEFAULT_IMAGE)} 
            alt={foundWriter.name} className="writer-page-profile-img"/>
            <br/>
            { foundWriter.description }
      </div>
      
      <div className="main-content">
        {/* this was section */}
        <div className="article-grid">
            <ArticleList articles={articlesbyWriter} title={desenitizedKey}/>
        </div>

        <aside className="sidebar">
          {/* Trending/news ticker */}
        </aside>
      </div>
    </div>
  );
};

export default WriterPage;