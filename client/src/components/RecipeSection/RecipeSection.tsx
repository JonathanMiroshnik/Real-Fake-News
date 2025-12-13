import { useEffect, useState } from 'react';
import RecipeList from '../RecipeList/RecipeList';
import SectionHeader from '../SectionHeader/SectionHeader';
import { useResponsiveArticlesCount } from '../../hooks/useResponsiveArticlesCount';
import { getRelevantRecipes } from '../../services/recipeService';
import { RecipeProps } from '../../types/recipe';
import { debugLog, debugWarn } from '../../utils/debugLogger';

function RecipeSection() {
  const [recipes, setRecipes] = useState<RecipeProps[]>([]);
  const [loading, setLoading] = useState(true);
  const recipesPerSection: number = useResponsiveArticlesCount();

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const fetchedRecipes = await getRelevantRecipes();
        setRecipes(fetchedRecipes);
        debugLog('🍳 [RecipeSection] Loaded recipes:', fetchedRecipes.length);
      } catch (error) {
        debugWarn('⚠️ [RecipeSection] Failed to load recipes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []);

  if (loading) {
    return <div className="py-8 text-center text-(--description-color)">Loading recipes...</div>;
  }

  if (recipes.length === 0) {
    return null;
  }

  return (
    <div className="my-8">
      <SectionHeader topLine="Recipes" bottomLine="Food" />
      <div className="flex justify-center">
        <RecipeList recipes={recipes} vertical={false} maxItems={recipesPerSection} />
      </div>
    </div>
  );
}

export default RecipeSection;

