import { randomInt } from 'crypto';
import { getFeaturedArticleForDate } from '../services/blogService.js';
import { getAllPostsAfterDate } from '../services/blogService.js';
import { update } from '../lib/database/sqliteOperations.js';
import { blogDatabaseConfig } from '../lib/database/databaseConfigurations.js';
import { ArticleScheme } from '../types/article.js';
import type { RandomBelow } from '../utils/random.js';
import { debugLog, debugWarn } from '../utils/debugLogger.js';

/**
 * Selects a random article from today's articles and sets it as featured
 * Only runs if no featured article exists for today
 *
 * @param randomBelow Picks the article index; defaults to `crypto.randomInt`.
 */
export async function selectDailyFeaturedArticle(
  randomBelow: RandomBelow = randomInt,
): Promise<void> {
  try {
    const today = getTodayDateString(); // YYYY-MM-DD format
    debugLog('⭐ [selectDailyFeaturedArticle] Checking for featured article for date:', today);

    // Check if featured article already exists for today
    const existingFeatured = await getFeaturedArticleForDate(today);
    if (existingFeatured) {
      debugLog(
        '⭐ [selectDailyFeaturedArticle] Featured article already exists for today:',
        existingFeatured.key,
        existingFeatured.title,
      );
      return;
    }

    // Get all articles created today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const result = await getAllPostsAfterDate(startOfDay);
    const todayArticles = result.articles;

    if (todayArticles.length === 0) {
      debugWarn(
        '⭐ [selectDailyFeaturedArticle] No articles found for today, cannot select featured article',
      );
      return;
    }

    // Randomly select one article
    const randomIndex = randomBelow(todayArticles.length);
    const selectedArticle = todayArticles[randomIndex];

    // Set as featured
    const featuredArticle: ArticleScheme = {
      ...selectedArticle,
      isFeatured: true,
      featuredDate: today,
    };

    const success = await update<ArticleScheme>(blogDatabaseConfig, featuredArticle);

    if (success) {
      debugLog(
        `✅ [selectDailyFeaturedArticle] Successfully set article as featured: ${selectedArticle.key} - ${selectedArticle.title}`,
      );
    } else {
      debugWarn('⚠️ [selectDailyFeaturedArticle] Failed to set article as featured');
    }
  } catch (error) {
    console.error('❌ [selectDailyFeaturedArticle] Error selecting featured article:', error);
  }
}

/**
 * Whether today still needs a featured article.
 *
 * The `if-due` guard of the scheduler entry. Selection is idempotent on its own
 * (it returns early when a hero exists), but asking first keeps a restart from
 * spending a date-query per boot and keeps the boot log honest about what ran.
 *
 * @returns `true` when no article is featured for today's date.
 */
export async function isFeaturedArticleDue(): Promise<boolean> {
  const today = getTodayDateString();
  const existingFeatured = await getFeaturedArticleForDate(today);
  return !existingFeatured;
}

/** Today as `YYYY-MM-DD`, in the process timezone (UTC in the containers). */
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}
