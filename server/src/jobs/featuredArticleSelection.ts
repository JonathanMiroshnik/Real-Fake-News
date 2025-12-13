import cron from 'node-cron';
import { randomInt } from 'crypto';
import { getFeaturedArticleForDate } from '../services/blogService.js';
import { getAllPostsAfterDate } from '../services/blogService.js';
import { updatePost } from '../lib/database/sqliteOperations.js';
import { blogDatabaseConfig } from '../lib/database/databaseConfigurations.js';
import { ArticleScheme } from '../types/article.js';
import { debugLog, debugWarn } from '../utils/debugLogger.js';
import { DAY_MILLISECS } from '../config/constants.js';

/**
 * Selects a random article from today's articles and sets it as featured
 * Only runs if no featured article exists for today
 */
export async function selectDailyFeaturedArticle(): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    debugLog('⭐ [selectDailyFeaturedArticle] Checking for featured article for date:', today);

    // Check if featured article already exists for today
    const existingFeatured = await getFeaturedArticleForDate(today);
    if (existingFeatured) {
      debugLog('⭐ [selectDailyFeaturedArticle] Featured article already exists for today:', existingFeatured.key, existingFeatured.title);
      return;
    }

    // Get all articles created today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const result = await getAllPostsAfterDate(startOfDay);
    const todayArticles = result.articles;

    if (todayArticles.length === 0) {
      debugWarn('⭐ [selectDailyFeaturedArticle] No articles found for today, cannot select featured article');
      return;
    }

    // Randomly select one article
    const randomIndex = randomInt(todayArticles.length);
    const selectedArticle = todayArticles[randomIndex];

    // Set as featured
    const featuredArticle: ArticleScheme = {
      ...selectedArticle,
      isFeatured: true,
      featuredDate: today
    };

    const success = await updatePost<ArticleScheme>(featuredArticle, blogDatabaseConfig);

    if (success) {
      debugLog(`✅ [selectDailyFeaturedArticle] Successfully set article as featured: ${selectedArticle.key} - ${selectedArticle.title}`);
    } else {
      debugWarn('⚠️ [selectDailyFeaturedArticle] Failed to set article as featured');
    }
  } catch (error) {
    console.error('❌ [selectDailyFeaturedArticle] Error selecting featured article:', error);
  }
}

/**
 * Schedules daily featured article selection at midnight
 * This is called by the scheduler initialization
 */
export function scheduleFeaturedArticleSelection(): void {
  // Run at midnight every day (00:00)
  cron.schedule('0 0 * * *', async () => {
    await selectDailyFeaturedArticle();
  });

  debugLog('📅 Scheduled daily featured article selection at midnight');

  // Also run immediately if no featured article exists for today
  selectDailyFeaturedArticle();
}

