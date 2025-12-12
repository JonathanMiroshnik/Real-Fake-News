import { Link } from 'react-router';
import { RecipeProps } from '../../types/recipe';
import { DEFAULT_IMAGE, getImageURLFromRecipe } from '../../services/imageService';
import { getLatestTime } from '../../services/timeService';
import Image from '../Image/Image';

import './RecipeListItem.css'

/**
 * Individual recipe list item component
 * @param recipe - Recipe data to display
 * - Handles image loading and fallbacks
 * - Formats timestamps with timeService
 * - Implements recipe navigation
 */
interface RecipeListItemProps {
    /** Complete recipe data object */
    recipe: RecipeProps;
    /** Controls whether the head image of the recipe is shown */
    showImage?: boolean;
    /** Controls whether you see the description */
    showDescription?: boolean;
    /** Controls whether you see the undertext */
    showUnderText?: boolean;
}

function RecipeListItem({recipe, showImage=true, showDescription=true, showUnderText=true}: RecipeListItemProps) {
    return (
        <Link className="recipe-list-item-title" to={`/recipe/${recipe.key}`}>
            <div className="recipe-list-item">
                {showImage && (
                    <Image
                        src={getImageURLFromRecipe(recipe, DEFAULT_IMAGE)}
                        alt={recipe.title ?? 'Recipe'}
                        className="recipe-list-item-head-image"
                        aspectRatio="16/9"
                        placeholder={true}
                        objectFit="cover"
                    />
                )}
                <h3 className='recipe-list-item-title-header'>
                    {recipe.title}
                </h3>
                { recipe.shortDescription && showDescription && <p className='recipe-list-item-description'>
                    {recipe.shortDescription}
                </p> }
                {showUnderText && <div className="recipe-list-item-undertext">
                    { recipe.author?.name + " | " +
                        (recipe.timestamp ? 
                            getLatestTime(new Date().getTime() - new Date(recipe.timestamp).getTime()) 
                        : "")
                    } 
                </div>}
            </div>
        </Link>
    );
}

export default RecipeListItem;

