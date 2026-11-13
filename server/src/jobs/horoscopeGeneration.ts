import {
  isHoroscopeDayComplete,
  generateHoroscopesForDate,
  saveHoroscopes,
} from '../services/horoscopeService.js';
import type { ContentPorts } from '../types/contentPorts.js';
import { ports as defaultPorts } from '../services/contentSources/index.js';
import { debugLog, debugWarn } from '../utils/debugLogger.js';

/**
 * Whether today's horoscopes have already been produced by this pipeline.
 *
 * This is the `if-due` guard of the scheduler entry: `saveHoroscopes()` upserts by
 * (date, sign), so running the job on a day that is already complete would spend
 * twelve LLM calls to overwrite twelve rows with near-identical text — once per
 * restart.
 *
 * @param ports The content source whose rows count as "produced"; defaults to the configured one.
 * @returns `true` when every zodiac sign already has a row for today from that source.
 */
export async function areTodaysHoroscopesDue(ports: ContentPorts = defaultPorts): Promise<boolean> {
  const isComplete = await isHoroscopeDayComplete(new Date(), ports.text.contentSource);
  return !isComplete;
}

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
