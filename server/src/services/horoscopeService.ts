import 'dotenv/config';
import type { AstrologicalData } from './astrologyService.js';
import type { ContentPorts } from '../types/contentPorts.js';
import type { Horoscope, ZodiacSign } from '../types/horoscope.js';
import { ZODIAC_SIGNS } from '../types/horoscope.js';
import { getDatabase } from '../lib/database/database.js';
import { ports as defaultPorts } from './contentSources/index.js';
import { LIVE_CONTENT_SOURCE } from '../types/contentSource.js';
import type { ContentSource } from '../types/contentSource.js';
import { debugLog } from '../utils/debugLogger.js';

/** Pause between signs, so the live provider is not hammered twelve times at once. */
const DELAY_BETWEEN_SIGNS_MS = 500;

/**
 * Waits between provider calls in the live set, and not at all in the mock set.
 *
 * The delay exists only to stay under the real provider's rate limit; in a job run
 * against mock text it would add six seconds of nothing per day generated.
 */
async function pauseBetweenSigns(ports: ContentPorts): Promise<void> {
  if (ports.text.contentSource === 'live') {
    await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_SIGNS_MS));
  }
}

/**
 * Generates a horoscope for a specific zodiac sign using LLM
 */
async function generateHoroscopeForSign(
  zodiacSign: ZodiacSign,
  astrologicalData: AstrologicalData,
  ports: ContentPorts,
): Promise<string> {
  const retrogradeInfo =
    astrologicalData.retrogrades.length > 0
      ? `Currently in retrograde: ${astrologicalData.retrogrades.join(', ')}. `
      : 'No planets are currently in retrograde. ';

  const planetaryPositions = astrologicalData.planets
    .map((p) => `${p.name} is in ${p.sign}${p.isRetrograde ? ' (retrograde)' : ''}`)
    .join(', ');

  const prompt = `You are a witty, entertaining horoscope writer for a satirical fake news website. Write a daily horoscope for ${zodiacSign} that is:

1. Entertaining and humorous, matching the tone of a parody news site
2. References the current astrological situation: ${retrogradeInfo}Planetary positions: ${planetaryPositions}
3. Includes some general astrological platitudes and advice
4. Is approximately 100-150 words
5. Has a playful, slightly absurd tone that fits a "Real Fake News" website
6. Does NOT predict specific events, but rather gives general guidance in a fun way

Write the horoscope now:`;

  try {
    const response = await ports.text.generate(prompt, 'text', 0.8);
    if (response?.success && response.generatedText) {
      return response.generatedText.trim();
    } else {
      throw new Error('Failed to generate horoscope text');
    }
  } catch (error) {
    console.error(`Error generating horoscope for ${zodiacSign}:`, error);
    // Return a fallback horoscope if LLM fails
    return `Dear ${zodiacSign}, the stars are aligning in mysterious ways today. ${retrogradeInfo}This cosmic configuration suggests that you should trust your instincts and embrace the unexpected. The universe has a sense of humor, and today might bring some delightful surprises. Remember, even when planets go retrograde, life goes forward - sometimes in the most amusing ways possible.`;
  }
}

/**
 * Generates horoscopes for all zodiac signs for a given date
 */
export async function generateHoroscopesForDate(
  date?: Date,
  ports: ContentPorts = defaultPorts,
): Promise<Horoscope[]> {
  const targetDate = date || new Date();
  const dateString = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

  // Fetch astrological data for the date
  const astrologicalData = await ports.transit.fetchTransits(targetDate);

  const horoscopes: Horoscope[] = [];

  // Generate horoscope for each zodiac sign
  for (const sign of ZODIAC_SIGNS) {
    try {
      const content = await generateHoroscopeForSign(sign, astrologicalData, ports);

      const horoscope: Horoscope = {
        date: dateString,
        zodiacSign: sign,
        content,
        astrologicalData,
        contentSource: ports.text.contentSource,
      };

      horoscopes.push(horoscope);

      await pauseBetweenSigns(ports);
    } catch (error) {
      console.error(`Error generating horoscope for ${sign}:`, error);
      // Continue with other signs even if one fails
    }
  }

  return horoscopes;
}

/**
 * Saves horoscopes to the database
 *
 * The `contentSource` each horoscope carries is written, not left to the column
 * default: a mock set stored as `live` would be indistinguishable from a generated
 * one (roadmap entry 6 of `plans/README.md`). A row without the field gets the default.
 */
export async function saveHoroscopes(horoscopes: Horoscope[]): Promise<boolean> {
  const db = getDatabase();

  try {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO horoscopes (date, zodiacSign, content, astrologicalData, createdAt, contentSource)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const horoscope of horoscopes) {
      stmt.run(
        horoscope.date,
        horoscope.zodiacSign,
        horoscope.content,
        JSON.stringify(horoscope.astrologicalData),
        horoscope.createdAt || new Date().toISOString(),
        horoscope.contentSource ?? LIVE_CONTENT_SOURCE,
      );
    }

    return true;
  } catch (error) {
    console.error('Error saving horoscopes:', error);
    return false;
  }
}

/**
 * Maps a `horoscopes` row to the API shape, carrying the provenance marker through.
 *
 * Without the marker a caller cannot tell a mock day from a generated one, so the
 * reader is the second half of what `saveHoroscopes` writes.
 */
function mapHoroscopeRow(row: any): Horoscope {
  return {
    id: row.id,
    date: row.date,
    zodiacSign: row.zodiacSign,
    content: row.content,
    astrologicalData: JSON.parse(row.astrologicalData),
    createdAt: row.createdAt,
    contentSource: row.contentSource ?? LIVE_CONTENT_SOURCE,
  };
}

/**
 * Gets horoscopes for a specific date (defaults to today)
 */
export async function getHoroscopesForDate(date?: Date): Promise<Horoscope[]> {
  const targetDate = date || new Date();
  const dateString = targetDate.toISOString().split('T')[0];

  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM horoscopes 
    WHERE date = ?
    ORDER BY zodiacSign
  `);

  const rows = stmt.all(dateString) as any[];

  return rows.map(mapHoroscopeRow);
}

/**
 * Gets horoscope for a specific zodiac sign and date
 */
export async function getHoroscopeForSign(
  zodiacSign: string,
  date?: Date,
): Promise<Horoscope | null> {
  const targetDate = date || new Date();
  const dateString = targetDate.toISOString().split('T')[0];

  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM horoscopes 
    WHERE date = ? AND zodiacSign = ?
  `);

  const row = stmt.get(dateString, zodiacSign) as any;

  if (!row) {
    return null;
  }

  return mapHoroscopeRow(row);
}

/**
 * Whether `date` already holds a full set of horoscopes from one content source.
 *
 * The same question `ensureHoroscopesForToday()` asks before generating, split out
 * so the scheduler's `if-due` guard and the read path cannot drift apart: a guard
 * that counted the table instead would call a seeded day complete and the job
 * would skip a live day forever.
 *
 * @param date The day to check (UTC date, as every container runs in UTC).
 * @param contentSource Rows from any other pipeline do not count.
 * @returns `true` when every zodiac sign has a row for that day from that source.
 */
export async function isHoroscopeDayComplete(
  date: Date,
  contentSource: ContentSource,
): Promise<boolean> {
  const existingHoroscopes = await getHoroscopesForDate(date);
  const producedByThisSource = existingHoroscopes.filter(
    (horoscope) => horoscope.contentSource === contentSource,
  );

  return producedByThisSource.length === ZODIAC_SIGNS.length;
}

/**
 * Generates and saves horoscopes for today if they don't exist
 *
 * The check is "has *this* pipeline produced today's twelve?", not "does the
 * table hold twelve?" — a seeded database holds twelve mock rows, so a correctly
 * wired live pipeline would otherwise never generate its own, and a mock one
 * would never replace them. The controller calls this on read, so the wrong
 * answer also decides what a user is served.
 *
 * @param ports source of the horoscope text; defaults to the configured ports.
 */
export async function ensureHoroscopesForToday(ports?: ContentPorts): Promise<Horoscope[]> {
  const contentSource = (ports ?? defaultPorts).text.contentSource;
  const today = new Date();

  // If we already have all twelve for today from this pipeline, return them
  if (await isHoroscopeDayComplete(today, contentSource)) {
    const existingHoroscopes = await getHoroscopesForDate(today);
    return existingHoroscopes.filter((horoscope) => horoscope.contentSource === contentSource);
  }

  // Otherwise, generate new ones — replacing this pipeline's rows for the day,
  // since `saveHoroscopes` upserts by (date, zodiacSign)
  debugLog('Generating horoscopes for today...');
  const horoscopes = await generateHoroscopesForDate(today, ports);
  await saveHoroscopes(horoscopes);
  debugLog(`Generated and saved ${horoscopes.length} horoscopes`);

  return horoscopes;
}
