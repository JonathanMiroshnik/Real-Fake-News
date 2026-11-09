/**
 * Recipes, the food names the recipe job draws from, and today's horoscopes.
 *
 * These three live together because they are the tables the *jobs* read rather
 * than the ones the client queries directly: seeding them makes the pipeline
 * runnable in dev without touching an LLM or the transit API.
 */
import { getDatabase } from '../../lib/database/database.js';
import { recipeDatabaseConfig } from '../../lib/database/databaseConfigurations.js';
import type { RecipeScheme } from '../../types/article.js';
import type { Writer } from '../../types/writer.js';
import {
  MOCK_FOODS,
  MOCK_HOROSCOPE_ENTRIES,
  MOCK_RECIPES,
  buildMockAstrologicalData,
  type MockRecipe,
} from '../../services/contentSources/mocks/mockContent.js';
import { LIVE_CONTENT_SOURCE, MOCK_CONTENT_SOURCE } from '../../types/contentSource.js';
import { hoursAgoToIso, toHoroscopeDate, type SeedContext } from './seedContext.js';
import { deleteSeedImage, ensureSeedImage } from './seedImages.js';
import { deleteMockRows, insertSeedRow } from './seedRows.js';

/** Builds the `recipes` row for one mock recipe. */
export function buildRecipeRow(
  mockRecipe: MockRecipe,
  author: Writer,
  context: SeedContext,
): RecipeScheme {
  return {
    key: mockRecipe.key,
    title: mockRecipe.title,
    paragraphs: mockRecipe.paragraphs,
    author,
    timestamp: hoursAgoToIso(context, mockRecipe.hoursAgo),
    category: 'Food',
    headImage: `${mockRecipe.key}.png`,
    images: [],
    shortDescription: mockRecipe.shortDescription,
    writerType: mockRecipe.writerType,
    contentSource: MOCK_CONTENT_SOURCE,
  };
}

/**
 * Inserts the recipes.
 *
 * @param authorsByKey writer rows seeded in the same run — recipes embed a full
 *   author object, exactly like articles do.
 */
export async function seedRecipes(
  context: SeedContext,
  authorsByKey: Map<string, Writer>,
): Promise<void> {
  const fallbackAuthor = authorsByKey.values().next().value;
  if (!fallbackAuthor) {
    throw new Error('seedRecipes needs at least one seeded writer');
  }

  for (const mockRecipe of MOCK_RECIPES) {
    const didCreateImage = await ensureSeedImage(mockRecipe.key, context.random);
    if (didCreateImage) context.report.imagesCreated++;

    const author = authorsByKey.get(mockRecipe.authorKey) ?? fallbackAuthor;
    const recipeRow = buildRecipeRow(mockRecipe, author, context);

    const wasInserted = await insertSeedRow(recipeRow, recipeDatabaseConfig, context);
    if (wasInserted) context.report.recipesInserted++;
  }
}

/**
 * Inserts the food names the recipe job samples from.
 *
 * Names are stored unprefixed (`Toast`, not `dev-toast`): they are fed straight
 * into the recipe prompt, so a prefix would show up in generated recipe text.
 * `--reset` therefore deletes exactly the names in MOCK_FOODS.
 */
export function seedFoods(context: SeedContext): void {
  const db = getDatabase();
  // A food row is only a name, so --force has nothing to rewrite: an existing
  // name already is the desired state. Insert-or-ignore is therefore correct
  // for both modes.
  const statement = db.prepare('INSERT OR IGNORE INTO foods (name) VALUES (?)');

  for (const foodName of MOCK_FOODS) {
    const result = statement.run(foodName);
    if (result.changes > 0) {
      context.report.foodsInserted++;
    } else {
      context.report.skipped++;
    }
  }
}

/**
 * Inserts today's horoscope set, one row per zodiac sign.
 *
 * `INSERT OR IGNORE` keeps an existing set (the horoscope service may already
 * have generated one); `--force` replaces it. The astrological data is derived
 * from the date, so the same day always describes the same sky.
 *
 * `--force` re-stamps the date as `mock`: replacing a live set with mock text
 * while leaving it marked `live` would be exactly the lie the column exists to
 * prevent (`plans/dev-content-marking.md`).
 */
export function seedHoroscopes(context: SeedContext): void {
  const db = getDatabase();
  const horoscopeDate = toHoroscopeDate(context);
  const astrologicalData = JSON.stringify(buildMockAstrologicalData(horoscopeDate));
  const insertVerb = context.options.force ? 'INSERT OR REPLACE' : 'INSERT OR IGNORE';
  const rowSource = context.options.force ? MOCK_CONTENT_SOURCE : LIVE_CONTENT_SOURCE;

  const statement = db.prepare(`
    ${insertVerb} INTO horoscopes (date, zodiacSign, content, astrologicalData, createdAt, contentSource)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const entry of MOCK_HOROSCOPE_ENTRIES) {
    const result = statement.run(
      horoscopeDate,
      entry.zodiacSign,
      entry.content,
      astrologicalData,
      context.now.toISOString(),
      rowSource,
    );

    if (result.changes > 0) {
      context.report.horoscopesInserted++;
    } else {
      context.report.skipped++;
    }
  }
}

/**
 * Removes seeded recipes, foods, images and today's horoscope set (`--reset`).
 *
 * Recipes are deleted by their `contentSource` marker.
 *
 * Horoscopes are the exception and stay keyed on the date, not on the marker: a
 * day's set is one row per sign behind `UNIQUE(date, zodiacSign)`, so a delete by
 * marker alone would leave a half-mock day behind (mock rows gone, live rows for
 * the remaining signs still served) and re-seeding would then rewrite just the
 * mock signs. Deleting the whole day keeps the table consistent, at the documented
 * cost that a live set for today is also removed — which is why `--reset` is a
 * development command.
 */
export async function resetSeededKitchenContent(context: SeedContext): Promise<void> {
  const db = getDatabase();
  const horoscopeDate = toHoroscopeDate(context);

  await deleteMockRows(recipeDatabaseConfig, context);

  const imageKeys = MOCK_RECIPES.map((recipe) => recipe.key);
  for (const imageKey of imageKeys) {
    context.report.removed += deleteSeedImage(imageKey);
  }

  const deleteFood = db.prepare('DELETE FROM foods WHERE name = ?');
  for (const foodName of MOCK_FOODS) {
    const result = deleteFood.run(foodName);
    context.report.removed += result.changes;
  }

  const deleteHoroscopes = db.prepare('DELETE FROM horoscopes WHERE date = ?');
  context.report.removed += deleteHoroscopes.run(horoscopeDate).changes;
}
