import { randomInt } from 'crypto';
import { MINIMAL_NUM_DAILY_RECIPES } from '../config/constants.js';
import {
  getAllRecipesAfterDate,
  generateRecipe,
  getRandomFoods,
} from '../services/recipeService.js';
import { getRandomWriter } from '../services/writerService.js';
import type { ContentPorts } from '../types/contentPorts.js';
import { ports as defaultPorts } from '../services/contentSources/index.js';
import type { RandomBelow } from '../utils/random.js';
import { debugLog, debugWarn } from '../utils/debugLogger.js';

/** How the job's random choices are made — see `utils/random.ts`. */
export interface RecipeGenerationOptions {
  ports?: ContentPorts;
  randomBelow?: RandomBelow;
}

/**
 * Generates scheduled recipes based on daily quota
 * @param writingInterval Time interval in milliseconds to check for recipes
 * @param options The content source to write with, and the random source to use
 */
export async function generateScheduledRecipes(
  writingInterval: number,
  options: RecipeGenerationOptions = {},
) {
  const ports = options.ports ?? defaultPorts;
  const randomBelow = options.randomBelow ?? randomInt;

  try {
    const result = await getAllRecipesAfterDate(new Date(Date.now() - writingInterval));
    const newRecipesNeeded: number = MINIMAL_NUM_DAILY_RECIPES - result.length;

    debugLog(
      `🍳 [generateScheduledRecipes] Current recipes in interval: ${result.length}, needed: ${newRecipesNeeded}`,
    );

    if (newRecipesNeeded <= 0) {
      debugLog('🍳 [generateScheduledRecipes] Sufficient recipes already exist');
      return;
    }

    // Get random foods from database
    const foods = await getRandomFoods(3); // Get 3 random foods
    if (foods.length === 0) {
      console.error(
        '❌ [generateScheduledRecipes] No foods found in database! Please add foods to the foods table.',
      );
      return;
    }

    debugLog(`🍳 [generateScheduledRecipes] Selected foods: ${foods.join(', ')}`);

    for (let i = 0; i < newRecipesNeeded; i++) {
      try {
        const writer = await getRandomWriter(randomBelow);
        const recipeFoods = await getRandomFoods(2 + randomBelow(2)); // 2-3 foods per recipe

        if (recipeFoods.length === 0) {
          debugWarn('⚠️ [generateScheduledRecipes] No foods available for recipe generation');
          break;
        }

        debugLog(
          `🍳 [generateScheduledRecipes] Generating recipe ${i + 1}/${newRecipesNeeded} with writer: ${writer.name}, foods: ${recipeFoods.join(', ')}`,
        );
        await generateRecipe(writer, recipeFoods, true, ports);
      } catch (error) {
        console.error(`❌ [generateScheduledRecipes] Error generating recipe ${i + 1}:`, error);
        // Continue with next recipe even if one fails
      }
    }

    debugLog('✅ [generateScheduledRecipes] Recipe generation cycle completed');
  } catch (error) {
    console.error('❌ [generateScheduledRecipes] Error in generateScheduledRecipes:', error);
    // Don't throw - allow the scheduler to continue running
  }
}
