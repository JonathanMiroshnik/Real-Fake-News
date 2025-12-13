import 'dotenv/config';
import { RecipeScheme } from '../types/article.js';
import { Writer } from '../types/writer.js';
import { Food } from '../types/food.js';
import { generateTextFromString } from './llmService.js';
import { generateAndSaveImage } from './imageService.js';
import { getUniqueKey } from '../utils/general.js';
import { getDatabase } from '../lib/database/database.js';
import { createPost } from '../lib/database/sqliteOperations.js';
import { recipeDatabaseConfig } from '../lib/database/databaseConfigurations.js';
import { getRandomWriter } from './writerService.js';
import { debugLog } from '../utils/debugLogger.js';

/**
 * Gets random foods from the foods table
 * @param count Number of foods to retrieve
 * @returns Array of food names
 */
export async function getRandomFoods(count: number = 3): Promise<string[]> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT name FROM foods ORDER BY RANDOM() LIMIT ?');
    const rows = stmt.all(count) as { name: string }[];
    return rows.map(row => row.name);
}

/**
 * Generates a recipe article using a writer and selected foods
 * @param writer The writer to use for generating the recipe
 * @param foods Array of food names to include in the recipe
 * @param saveRecipe Whether to save the recipe to the database
 * @returns The generated recipe or undefined if generation fails
 */
export async function generateRecipe(writer: Writer, foods: string[], saveRecipe: boolean = true): Promise<RecipeScheme | undefined> {
    try {
        const prompt = createRecipePrompt(writer, foods);
        
        debugLog('🍳 [generateRecipe] Generating recipe with foods:', foods.join(', '));
        const result = await generateTextFromString(prompt, 'json_object');
        
        if (result === undefined || !result?.success) {
            console.error('❌ [generateRecipe] Recipe generation failed - invalid response');
            return undefined;
        }

        let parsedData: any;
        try {
            parsedData = JSON.parse(result.generatedText);
        } catch (error) {
            console.error('❌ [generateRecipe] Failed to parse LLM JSON response:', error);
            console.error('❌ [generateRecipe] Raw response:', result.generatedText?.substring(0, 500));
            return undefined;
        }

        // Generate head image
        const headImagePrompt = parsedData.headImagePrompt || parsedData.prompt || `A beautiful photo of ${parsedData.title || 'a recipe'}`;
        const headImageName = await generateAndSaveImage(headImagePrompt);

        // Generate additional images for the recipe
        const imagePrompts = parsedData.imagePrompts || [];
        const images: string[] = [];
        
        for (const imgPrompt of imagePrompts) {
            const imgName = await generateAndSaveImage(imgPrompt);
            if (imgName) {
                images.push(imgName);
            }
        }

        const newRecipe: RecipeScheme = {
            key: getUniqueKey(),
            title: parsedData.title,
            paragraphs: parsedData.paragraphs || [],
            author: writer,
            timestamp: new Date().toISOString(),
            category: 'Food',
            headImage: headImageName,
            images: images,
            shortDescription: parsedData.shortDescription,
            writerType: 'AI'
        };

        if (saveRecipe) {
            await createPost<RecipeScheme>(newRecipe, recipeDatabaseConfig);
            debugLog('✅ [generateRecipe] Recipe saved:', newRecipe.key);
        }

        return newRecipe;
    } catch (error) {
        console.error('❌ [generateRecipe] Error generating recipe:', error);
        return undefined;
    }
}

/**
 * Creates the prompt for recipe generation
 */
function createRecipePrompt(writer: Writer, foods: string[]): string {
    const foodsList = foods.join(', ');
    
    return `
Roleplay as a chef and food writer. When writing your response, do not comment on it, instead just write a recipe article about the given foods and make it professional and engaging.

Please parse this request to a JSON output. I will give examples after.

The recipe should be structured as a series of paragraphs that will be interleaved with images. Each paragraph should be a separate string in the paragraphs array.

Make sure the content of the recipe is detailed and engaging. The paragraphs should be in markdown format, meaning that you should emphasize words and phrases as you see fit in accordance to markdown rules.

${writer.name !== "" ? "Your name is " + writer.name + "." : ""}
${writer.description !== "" ? "Your description is " + writer.description + "." : ""}
${writer.systemPrompt !== "" ? "A further prompt that defines you and how you write: \n\n" + writer.systemPrompt : ""}

I want you to create a recipe using the following foods: ${foodsList}

The recipe should:
- Have a catchy and descriptive title
- Include multiple paragraphs that describe the recipe, ingredients, preparation steps, cooking instructions, and tips
- Be written in your unique style and personality
- Be engaging and fun to read

In the headImagePrompt section of the output, I want you to write an image prompt for an image generation model that will make a beautiful, appetizing image related to and illustrative of the recipe (this will be the main/head image).

In the imagePrompts section, I want you to provide an array of image prompts (at least 2-3) for additional images that will be interleaved with the paragraphs. These should show different aspects of the recipe (ingredients, preparation steps, final dish, etc.).

In the shortDescription section of the output, I want you to give a very short and catchy 1 or 2 line description of the recipe.

Make sure that the title of the recipe is at most half the length of the short description.
The short description should not have many repeated terms from the title. The title takes precedence in importance.

EXAMPLE JSON OUTPUT:
{
    "title": "Spicy Mango Chicken Tacos with Avocado Crema",
    "category": "Food",
    "paragraphs": [
        "These vibrant tacos combine the sweet heat of mango with tender chicken, all wrapped in warm tortillas and topped with a creamy avocado sauce. Perfect for a summer evening or when you're craving something with bold flavors.",
        "## Ingredients",
        "For the chicken marinade, you'll need: 2 boneless, skinless chicken breasts, 1 ripe mango (diced), 2 tablespoons of chili powder, 1 teaspoon of cumin, salt and pepper to taste, and a splash of lime juice.",
        "For the avocado crema: 2 ripe avocados, 1/4 cup of sour cream, 1 clove of garlic (minced), fresh cilantro, and a squeeze of lime.",
        "## Preparation",
        "Start by marinating the chicken. Combine the diced mango, chili powder, cumin, salt, pepper, and lime juice in a bowl. Add the chicken and let it marinate for at least 30 minutes, though overnight is even better.",
        "While the chicken marinates, prepare your avocado crema by blending the avocados, sour cream, garlic, cilantro, and lime juice until smooth. Set this aside in the refrigerator.",
        "## Cooking",
        "Heat a large skillet over medium-high heat. Cook the marinated chicken for 6-8 minutes per side, until cooked through and slightly charred. Let it rest for a few minutes, then slice into strips.",
        "Warm your tortillas in a dry pan or directly over a gas flame for a few seconds on each side. Fill each tortilla with the sliced chicken, top with the avocado crema, and garnish with fresh cilantro and diced mango.",
        "## Tips",
        "For an extra kick, add a dash of hot sauce to the marinade. If you're short on time, you can use pre-made mango salsa instead of fresh mango. These tacos pair beautifully with a cold beer or a margarita!"
    ],
    "headImagePrompt": "A beautiful, appetizing photo of spicy mango chicken tacos with avocado crema, garnished with fresh cilantro and diced mango, on a rustic wooden table, professional food photography, natural lighting",
    "imagePrompts": [
        "Fresh ingredients for mango chicken tacos: ripe mango, chicken breasts, chili powder, limes, and fresh cilantro arranged on a cutting board",
        "Close-up of marinated chicken cooking in a skillet, showing the charred edges and vibrant colors",
        "Finished spicy mango chicken tacos on a plate, with avocado crema drizzled on top, garnished with cilantro and mango pieces"
    ],
    "shortDescription": "A vibrant fusion of sweet mango and spicy chicken, wrapped in warm tortillas and topped with creamy avocado crema. Perfect for summer evenings!"
}

Now generate a recipe using the foods: ${foodsList}
`;
}

/**
 * Gets all recipes after a certain date
 */
export async function getAllRecipesAfterDate(startDate: Date): Promise<RecipeScheme[]> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM recipes WHERE timestamp > ? ORDER BY timestamp DESC');
    const rows = stmt.all(startDate.toISOString()) as any[];
    
    return rows.map(row => ({
        key: row.key,
        title: row.title,
        paragraphs: row.paragraphs ? JSON.parse(row.paragraphs) : undefined,
        author: row.author ? JSON.parse(row.author) : undefined,
        timestamp: row.timestamp,
        category: row.category,
        headImage: row.headImage,
        images: row.images ? JSON.parse(row.images) : undefined,
        shortDescription: row.shortDescription,
        writerType: row.writerType || 'AI'
    } as RecipeScheme));
}

/**
 * Gets all recipes
 */
export async function getAllRecipes(): Promise<RecipeScheme[]> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM recipes ORDER BY timestamp DESC');
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
        key: row.key,
        title: row.title,
        paragraphs: row.paragraphs ? JSON.parse(row.paragraphs) : undefined,
        author: row.author ? JSON.parse(row.author) : undefined,
        timestamp: row.timestamp,
        category: row.category,
        headImage: row.headImage,
        images: row.images ? JSON.parse(row.images) : undefined,
        shortDescription: row.shortDescription,
        writerType: row.writerType || 'AI'
    } as RecipeScheme));
}

