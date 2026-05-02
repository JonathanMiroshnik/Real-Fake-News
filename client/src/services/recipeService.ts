import { RecipeProps } from "../types/recipe";
import { getApiBaseUrlWithPrefix } from "../config/apiConfig";
import { debugLog, debugError } from "../utils/debugLogger";

/**
 * Fetches all recipes from the server
 * @returns Array of recipes
 */
export async function getRelevantRecipes(): Promise<RecipeProps[]> {
  debugLog("🚀 [getRelevantRecipes] Function called");

  const VITE_API_BASE = getApiBaseUrlWithPrefix();
  const url = `${VITE_API_BASE}/recipes/relevant`;
  debugLog("📡 [getRelevantRecipes] Fetching from URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      debugError(
        `❌ [getRelevantRecipes] Fetch failed: ${response.status} ${response.statusText}`,
      );
      const errorText = await response.text().catch(() => "No error details");
      debugError(`❌ [getRelevantRecipes] Error response:`, errorText);
      return [];
    }

    const data = await response.json();
    if (data.success && data.recipes) {
      debugLog(
        "✅ [getRelevantRecipes] Successfully fetched recipes:",
        data.recipes.length,
      );
      return data.recipes as RecipeProps[];
    } else {
      debugLog("📦 [getRelevantRecipes] No recipes found in response");
      return [];
    }
  } catch (error) {
    debugError("❌ [getRelevantRecipes] Network error:", error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      debugError(
        "❌ [getRelevantRecipes] Could not connect to server. Is it running?",
      );
    }
    return [];
  }
}

/**
 * Fetches a single recipe by key from the server
 * @param key The recipe key to fetch
 * @returns The recipe if found, undefined otherwise
 */
export async function getRecipeByKey(
  key: string,
): Promise<RecipeProps | undefined> {
  debugLog("🚀 [getRecipeByKey] Function called for key:", key);

  const VITE_API_BASE = getApiBaseUrlWithPrefix();
  const url = `${VITE_API_BASE}/recipes/${key}`;
  debugLog("📡 [getRecipeByKey] Fetching from URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        debugLog("📦 [getRecipeByKey] Recipe not found (404)");
        return undefined;
      }
      debugError(
        `❌ [getRecipeByKey] Fetch failed: ${response.status} ${response.statusText}`,
      );
      const errorText = await response.text().catch(() => "No error details");
      debugError(`❌ [getRecipeByKey] Error response:`, errorText);
      return undefined;
    }

    const data = await response.json();
    if (data.success && data.recipe) {
      debugLog(
        "✅ [getRecipeByKey] Successfully fetched recipe:",
        data.recipe.key,
      );
      return data.recipe as RecipeProps;
    } else {
      debugLog("📦 [getRecipeByKey] Recipe not found in response");
      return undefined;
    }
  } catch (error) {
    debugError("❌ [getRecipeByKey] Network error:", error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      debugError(
        "❌ [getRecipeByKey] Could not connect to server. Is it running at",
        VITE_API_BASE,
        "?",
      );
    }
    return undefined;
  }
}
