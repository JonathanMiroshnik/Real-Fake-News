import { Horoscope, HoroscopeResponse, AstrologicalData } from '../types/horoscope';
import { getApiBaseUrlWithPrefix } from '../config/apiConfig';
import { debugLog, debugError } from '../utils/debugLogger';

/**
 * Fetches all horoscopes for today (or specified date)
 */
export async function getHoroscopes(date?: Date): Promise<Horoscope[]> {
  debugLog('🔮 [getHoroscopes] Fetching horoscopes...');

  const apiBase = getApiBaseUrlWithPrefix();
  let url = `${apiBase}/horoscopes`;

  if (date) {
    const dateString = date.toISOString().split('T')[0];
    url += `?date=${dateString}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      debugError(`❌ [getHoroscopes] Fetch failed: ${response.status} ${response.statusText}`);
      return [];
    }

    const data: HoroscopeResponse = await response.json();

    if (data.success && data.horoscopes) {
      debugLog(`✅ [getHoroscopes] Fetched ${data.horoscopes.length} horoscopes`);
      return data.horoscopes;
    } else {
      debugError(`❌ [getHoroscopes] API returned error: ${data.error || 'Unknown error'}`);
      return [];
    }
  } catch (error) {
    debugError('❌ [getHoroscopes] Network error:', error);
    return [];
  }
}

/**
 * Fetches horoscope for a specific zodiac sign
 */
export async function getHoroscopeBySign(sign: string, date?: Date): Promise<Horoscope | null> {
  debugLog(`🔮 [getHoroscopeBySign] Fetching horoscope for ${sign}...`);

  const apiBase = getApiBaseUrlWithPrefix();
  let url = `${apiBase}/horoscopes/${sign}`;

  if (date) {
    const dateString = date.toISOString().split('T')[0];
    url += `?date=${dateString}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      debugError(`❌ [getHoroscopeBySign] Fetch failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: HoroscopeResponse = await response.json();

    if (data.success && data.horoscope) {
      debugLog(`✅ [getHoroscopeBySign] Fetched horoscope for ${sign}`);
      return data.horoscope;
    } else {
      debugError(`❌ [getHoroscopeBySign] API returned error: ${data.error || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    debugError('❌ [getHoroscopeBySign] Network error:', error);
    return null;
  }
}

/**
 * Fetches raw astrological data (planetary positions, retrogrades)
 */
export async function getAstrologicalData(date?: Date): Promise<AstrologicalData | null> {
  debugLog('🔮 [getAstrologicalData] Fetching astrological data...');

  const apiBase = getApiBaseUrlWithPrefix();
  let url = `${apiBase}/horoscopes/astrological-data`;

  if (date) {
    const dateString = date.toISOString().split('T')[0];
    url += `?date=${dateString}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      debugError(
        `❌ [getAstrologicalData] Fetch failed: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = await response.json();

    if (data.success && data.data) {
      debugLog('✅ [getAstrologicalData] Fetched astrological data');
      return data.data;
    } else {
      debugError(`❌ [getAstrologicalData] API returned error: ${data.error || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    debugError('❌ [getAstrologicalData] Network error:', error);
    return null;
  }
}
