import { generateHoroscopesForDate, saveHoroscopes } from '../services/horoscopeService.js';
import { debugLog, debugWarn } from '../utils/debugLogger.js';

/**
 * Generates horoscopes for today
 * This function is called by the scheduler to ensure horoscopes are generated daily
 */
export async function generateDailyHoroscopes(): Promise<void> {
  try {
    debugLog('🔮 Starting daily horoscope generation...');
    const today = new Date();
    const horoscopes = await generateHoroscopesForDate(today);

    if (horoscopes.length > 0) {
      const saved = await saveHoroscopes(horoscopes);
      if (saved) {
        debugLog(
          `✅ Successfully generated and saved ${horoscopes.length} horoscopes for ${today.toISOString().split('T')[0]}`,
        );
      } else {
        console.error('❌ Failed to save horoscopes to database');
      }
    } else {
      debugWarn('⚠️ No horoscopes were generated');
    }
  } catch (error) {
    console.error('❌ Error generating daily horoscopes:', error);
  }
}

/**
 * Schedules daily horoscope generation at midnight
 * This is called by the scheduler initialization
 *
 * @deprecated Use AbsoluteClock `registerJob` instead. Kept for backwards compatibility.
 */
export function scheduleHoroscopeGeneration(): void {
  // Previously used cron.schedule directly. Now scheduling is handled
  // by the AbsoluteClock engine. Calling this still runs immediately.
  generateDailyHoroscopes();
}
