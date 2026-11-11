import cron from 'node-cron';
import { generateHoroscopesForDate, saveHoroscopes } from '../services/horoscopeService.js';
import type { ContentPorts } from '../types/contentPorts.js';
import { ports as defaultPorts } from '../services/contentSources/index.js';
import { debugLog, debugWarn } from '../utils/debugLogger.js';

/**
 * Generates horoscopes for today
 * This function is called by the scheduler to ensure horoscopes are generated daily
 *
 * @param ports The content source to write the horoscopes with; the source name is
 * stamped onto every row, so a mock run stays identifiable afterwards.
 */
export async function generateDailyHoroscopes(ports: ContentPorts = defaultPorts): Promise<void> {
  try {
    debugLog('🔮 Starting daily horoscope generation...');
    const today = new Date();
    const horoscopes = await generateHoroscopesForDate(today, ports);

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
 */
export function scheduleHoroscopeGeneration(): void {
  // Run at midnight every day (00:00)
  cron.schedule('0 0 * * *', async () => {
    await generateDailyHoroscopes();
  });

  debugLog('📅 Scheduled daily horoscope generation at midnight');

  // Also generate horoscopes immediately if they don't exist for today
  generateDailyHoroscopes();
}
