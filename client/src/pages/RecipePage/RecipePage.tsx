import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { DEFAULT_IMAGE, getImageURLFromRecipe, getImageURL } from '../../services/imageService';
import { sanitizeWriterName } from '../../services/writerService';
import { getRecipeByKey } from '../../services/recipeService';
import { RecipeProps } from '../../types/recipe';
import Image from '../../components/Image/Image';
import './RecipePage.css'

function RecipePage() {
  const { key } = useParams();
  const [foundRecipe, setFoundRecipe] = useState<RecipeProps | null | undefined>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!key) {
      setFoundRecipe(undefined);
      setLoading(false);
      return;
    }

    async function fetchRecipe() {
      setLoading(true);
      const recipe = await getRecipeByKey(key ?? '');
      setFoundRecipe(recipe || undefined);
      setLoading(false);
    }

    fetchRecipe();
  }, [key]);

  if (loading) {
    return <div>Loading recipe...</div>;
  }

  if (foundRecipe === null || foundRecipe === undefined) {
    return <div>RECIPE NOT FOUND</div>;
  }

  let headImageURL = getImageURLFromRecipe(foundRecipe, DEFAULT_IMAGE);
  const paragraphs = foundRecipe.paragraphs || [];
  const images = foundRecipe.images || [];

  // Interleave paragraphs and images
  // First paragraph, then image, then paragraph, then image, etc.
  const content: Array<{ type: 'paragraph' | 'image'; content: string }> = [];
  
  for (let i = 0; i < paragraphs.length; i++) {
    content.push({ type: 'paragraph', content: paragraphs[i] });
    if (i < images.length) {
      content.push({ type: 'image', content: images[i] });
    }
  }

  return (
    <article className="recipe-article">
      <div className="recipe-header">
        <h2 className="recipe-title-header">{ foundRecipe?.title }</h2>
        <div className="recipe-meta">
          <div>
            {"By \t"}
            {foundRecipe.author?.name ? 
              <Link className="recipe-writer" to={`/writer/${sanitizeWriterName(foundRecipe.author?.name)}`}> 
                  <span className="author">{ foundRecipe?.author?.name }</span>
              </Link>: null
            }
          </div>
            <span className="timestamp">{ foundRecipe.timestamp ? new Date(foundRecipe.timestamp).toLocaleDateString() : null }</span>
            <span className="category">{ foundRecipe?.category }</span>
        </div>
      </div>
      
      {headImageURL !== "" && (
        <div className='recipe-page-head-image'>
          <Image
            src={headImageURL}
            alt={foundRecipe.title ?? 'Recipe'}
            className="recipe-image"
            aspectRatio="16/9"
            placeholder={true}
            objectFit="cover"
          />
        </div>
      )}
      <div className="recipe-content">
        {content.map((item, index) => {
          if (item.type === 'paragraph') {
            return (
              <div key={`paragraph-${index}`} className="recipe-paragraph">
                <ReactMarkdown>{item.content}</ReactMarkdown>
              </div>
            );
          } else {
            const imageURL = getImageURL(item.content);
            return (
              <div key={`image-${index}`} className="recipe-content-image">
                <Image
                  src={imageURL}
                  alt={foundRecipe.title ?? 'Recipe step'}
                  className="recipe-step-image"
                  aspectRatio="16/9"
                  placeholder={true}
                  objectFit="cover"
                />
              </div>
            );
          }
        })}
      </div>
    </article>
  );
}

export default RecipePage;

