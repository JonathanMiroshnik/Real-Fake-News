import { RecipeProps } from '../../types/recipe';
import RecipeListItem from '../RecipeListItem/RecipeListItem';

import './RecipeList.css'

/**
 * Generic recipe list component with optional title
 * @param title - Optional section heading
 * @param recipes - Array of recipes to display
 * - Handles empty state automatically
 * - Uses standardized list styling
 */
interface RecipeListProps {
    /** Optional section heading text */
    title?: string;
    /** Array of recipes to display */
    recipes: RecipeProps[];
    /** Vertical or Horizontal list */
    vertical?: boolean;
    /** Maximum number of recipes to be displayed */
    maxItems?: number;
    /** Controls whether images of recipes are shown */
    showImages?: boolean;
}

function RecipeList({title = "", recipes, vertical = false, maxItems = 4, showImages=true}: RecipeListProps) {
    return (
        recipes.length > 0 &&
        <div className="recipe-list-main">
            { title && <h2 className="recipe-list-title">{ title }</h2>}
            
            <ul className={`recipe-list-ul recipe-list-ul-${vertical ? "vertical": "horizontal"}`} >
                { recipes.slice(0, maxItems).map((recipe) => (
                    <li key={"recipe_list_item_" + recipe.key} >
                        <RecipeListItem showImage={showImages} recipe={recipe}/>
                    </li>
                )) }
            </ul>
        </div>
    );
}

export default RecipeList;

