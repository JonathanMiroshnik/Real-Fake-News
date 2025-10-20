import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ArticleContext } from '../../contexts/ArticlesContext';
import ArticleList from '../../components/ArticleList/ArticleList';
import { desanitizeWriterName } from '../../services/writerService';
import { getImageURLFromWriter } from '../../services/imageService';
import { DEFAULT_IMAGE } from '../../services/imageService';
import './WriterPage.css'

/**
 * Writer profile page showing biography and articles
 * @param key - URL-sanitized writer name from route params
 * @returns Writer profile layout with article list
 */
function WriterPage() {
  // Route parameter handling
  const { key } = useParams();
  if (key === null || key === undefined) {
    return <div>WRITER INVALID</div>;
  }

  // Name desanitization using service utility
  const desenitizedKey = desanitizeWriterName(key || '');

  // Context data access
  const { writers, articles } = useContext(ArticleContext);

  // const currentWriters = useContext(ArticleContext).writers; 
  // Find matching writer
  const foundWriter = writers.find((w) => w.name === desenitizedKey);
  if (foundWriter === null || foundWriter === undefined) {
    return <div>WRITER NOT FOUND</div>;
  }

  // const currentArticles = useContext(ArticleContext).articles;    
  // Filter writer's articles
  const articlesbyWriter = articles.filter((a) => 
    a.author?.name === desenitizedKey
  );
  const authorName = desenitizedKey;
  // const articlesbyWriter: ArticleProps[] = currentArticles.filter((article) => {
  //       if (article.author === undefined) {
  //           return false;
  //       }
  //       return article.author?.name === desenitizedKey;
  // });  

  return (
    <div className="home-container">
      <div className="writer-profile-section">
            <h2 className="writer-name">{ authorName }</h2>
            <img src={getImageURLFromWriter(foundWriter, DEFAULT_IMAGE)} 
            alt={foundWriter.name} className="writer-page-profile-img"/>
            <br/>
            <p className="writer-description">{ foundWriter.description }</p>            
      </div>
      
      <div className="main-content">
        {/* this was section */}
        <div className="article-grid">
            <ArticleList articles={articlesbyWriter} vertical={false}/>
        </div>
      </div>
    </div>
  );
};

export default WriterPage;
