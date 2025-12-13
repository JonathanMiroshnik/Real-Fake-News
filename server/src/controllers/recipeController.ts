import { Request, Response } from 'express';
import { RecipeScheme } from '../types/article.js';
import { getAllRecipesAfterDate, getAllRecipes } from '../services/recipeService.js';
import { getPostByKey } from '../lib/database/sqliteOperations.js';
import { recipeDatabaseConfig } from '../lib/database/databaseConfigurations.js';
import { DAY_MILLISECS } from '../config/constants.js';
import { debugLog } from '../utils/debugLogger.js';

export async function getRelevantRecipesController(req: Request, res: Response) {
    debugLog('📥 Received request to /api/recipes/relevant');
    
    try {
        const recipes = await getAllRecipes();
        debugLog('📥 Returning', recipes.length, 'recipes');
        
        res.json({
            success: true,
            recipes: recipes
        });
    } catch (error) {
        console.error('❌ Error in getRelevantRecipesController:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch recipes' 
        });
    }
}

export async function getDailyRecipesController(req: Request, res: Response) {
    debugLog('📥 Received request to /api/recipes/daily');
    
    try {
        const recipes = await getAllRecipesAfterDate(new Date(Date.now() - DAY_MILLISECS));
        debugLog('📥 Returning', recipes.length, 'daily recipes');
        
        res.json({
            success: true,
            recipes: recipes
        });
    } catch (error) {
        console.error('❌ Error in getDailyRecipesController:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch daily recipes' 
        });
    }
}

export async function getRecipeByKeyController(req: Request, res: Response) {
    const { key } = req.params;
    debugLog('📥 Received request to /api/recipes/:key for key:', key);
    
    if (!key) {
        res.status(400).json({ 
            success: false,
            error: 'Recipe key is required' 
        });
        return;
    }
    
    try {
        const recipe = await getPostByKey<RecipeScheme>(key, recipeDatabaseConfig);
        
        if (recipe) {
            debugLog('📥 Returning recipe:', recipe.key, recipe.title);
            res.json({
                success: true,
                recipe: recipe
            });
        } else {
            debugLog('📥 Recipe not found for key:', key);
            res.status(404).json({ 
                success: false,
                error: 'Recipe not found' 
            });
        }
    } catch (error) {
        console.error('❌ Error in getRecipeByKeyController:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch recipe' 
        });
    }
}

