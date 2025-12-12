import 'dotenv/config'
import { fetchAstrologicalData, AstrologicalData } from './astrologyService.js';
import { generateTextFromString } from './llmService.js';
import { Horoscope, ZODIAC_SIGNS } from '../types/horoscope.js';
import { getDatabase } from '../lib/database/database.js';

/**
 * Generates a horoscope for a specific zodiac sign using LLM
 */
async function generateHoroscopeForSign(
  zodiacSign: string,
  astrologicalData: AstrologicalData
): Promise<string> {
  const retrogradeInfo = astrologicalData.retrogrades.length > 0
    ? `Currently in retrograde: ${astrologicalData.retrogrades.join(', ')}. `
    : 'No planets are currently in retrograde. ';

  const planetaryPositions = astrologicalData.planets
    .map(p => `${p.name} is in ${p.sign}${p.isRetrograde ? ' (retrograde)' : ''}`)
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
    const response = await generateTextFromString(prompt, 'text', 0.8);
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
export async function generateHoroscopesForDate(date?: Date): Promise<Horoscope[]> {
  const targetDate = date || new Date();
  const dateString = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

  // Fetch astrological data for the date
  const astrologicalData = await fetchAstrologicalData(targetDate);

  const horoscopes: Horoscope[] = [];

  // Generate horoscope for each zodiac sign
  for (const sign of ZODIAC_SIGNS) {
    try {
      const content = await generateHoroscopeForSign(sign, astrologicalData);
      
      const horoscope: Horoscope = {
        date: dateString,
        zodiacSign: sign,
        content,
        astrologicalData
      };

      horoscopes.push(horoscope);
      
      // Small delay to avoid overwhelming the LLM API
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error generating horoscope for ${sign}:`, error);
      // Continue with other signs even if one fails
    }
  }

  return horoscopes;
}

/**
 * Saves horoscopes to the database
 */
export async function saveHoroscopes(horoscopes: Horoscope[]): Promise<boolean> {
  const db = getDatabase();

  try {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO horoscopes (date, zodiacSign, content, astrologicalData, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const horoscope of horoscopes) {
      stmt.run(
        horoscope.date,
        horoscope.zodiacSign,
        horoscope.content,
        JSON.stringify(horoscope.astrologicalData),
        horoscope.createdAt || new Date().toISOString()
      );
    }

    return true;
  } catch (error) {
    console.error('Error saving horoscopes:', error);
    return false;
  }
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

  return rows.map(row => ({
    id: row.id,
    date: row.date,
    zodiacSign: row.zodiacSign,
    content: row.content,
    astrologicalData: JSON.parse(row.astrologicalData),
    createdAt: row.createdAt
  }));
}

/**
 * Gets horoscope for a specific zodiac sign and date
 */
export async function getHoroscopeForSign(
  zodiacSign: string,
  date?: Date
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

  return {
    id: row.id,
    date: row.date,
    zodiacSign: row.zodiacSign,
    content: row.content,
    astrologicalData: JSON.parse(row.astrologicalData),
    createdAt: row.createdAt
  };
}

/**
 * Generates and saves horoscopes for today if they don't exist
 */
export async function ensureHoroscopesForToday(): Promise<Horoscope[]> {
  const today = new Date();
  const existingHoroscopes = await getHoroscopesForDate(today);

  // If we already have horoscopes for today, return them
  if (existingHoroscopes.length === 12) {
    return existingHoroscopes;
  }

  // Otherwise, generate new ones
  console.log('Generating horoscopes for today...');
  const horoscopes = await generateHoroscopesForDate(today);
  await saveHoroscopes(horoscopes);
  console.log(`Generated and saved ${horoscopes.length} horoscopes`);

  return horoscopes;
}

