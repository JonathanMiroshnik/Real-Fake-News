import 'dotenv/config'
import axios from 'axios';
import { debugWarn } from '../utils/debugLogger.js';

export interface PlanetaryPosition {
  name: string;
  longitude: number;
  latitude: number;
  sign: string;
  isRetrograde: boolean;
  house?: number;
}

export interface AstrologicalData {
  date: string;
  planets: PlanetaryPosition[];
  retrogrades: string[]; // List of planet names in retrograde
  notableAspects?: string[]; // Optional: notable planetary aspects
}

// Cache for astrological data (update once per day)
let cachedAstrologicalData: AstrologicalData | null = null;
let cacheDate: string | null = null;

/**
 * Fetches current planetary positions and retrograde status
 * Uses FreeAstroAPI (freeastroapi.com) for astrological data
 * Caches data for the current day to avoid excessive API calls
 */
export async function fetchAstrologicalData(date?: Date): Promise<AstrologicalData> {
  const targetDate = date || new Date();
  const dateString = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format

  // Return cached data if it's for the same day
  if (cachedAstrologicalData && cacheDate === dateString) {
    return cachedAstrologicalData;
  }

  try {
    // FreeAstroAPI endpoint for current planetary positions
    // Using a general chart calculation endpoint
    const apiUrl = 'https://api.freeastroapi.com/planets';
    
    // For now, we'll use a simplified approach with a default location
    // In a real implementation, you might want to use a specific location
    const response = await axios.get(apiUrl, {
      params: {
        date: dateString,
        time: '12:00', // Noon UTC
        lat: 0, // Equator (general position)
        lon: 0, // Prime meridian
        tz: 0 // UTC
      },
      timeout: 10000 // 10 second timeout
    });

    // Parse the response and extract planetary data
    const planets: PlanetaryPosition[] = [];
    const retrogrades: string[] = [];

    if (response.data && response.data.planets) {
      for (const planet of response.data.planets) {
        const planetData: PlanetaryPosition = {
          name: planet.name || planet.planet,
          longitude: planet.longitude || 0,
          latitude: planet.latitude || 0,
          sign: getSignFromLongitude(planet.longitude || 0),
          isRetrograde: planet.retrograde === true || planet.isRetrograde === true
        };

        planets.push(planetData);

        if (planetData.isRetrograde) {
          retrogrades.push(planetData.name);
        }
      }
    } else {
      // Fallback: Create basic planetary data structure if API response is different
      // This is a fallback in case the API structure is different
      debugWarn('Unexpected API response structure, using fallback data');
      return createFallbackAstrologicalData(dateString);
    }

    const astrologicalData: AstrologicalData = {
      date: dateString,
      planets,
      retrogrades
    };

    // Cache the data
    cachedAstrologicalData = astrologicalData;
    cacheDate = dateString;

    return astrologicalData;
  } catch (error) {
    console.error('Failed to fetch astrological data:', error);
    // Return fallback data if API fails
    return createFallbackAstrologicalData(dateString);
  }
}

/**
 * Converts longitude (0-360 degrees) to zodiac sign
 */
function getSignFromLongitude(longitude: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  const signIndex = Math.floor(longitude / 30);
  return signs[signIndex % 12];
}

/**
 * Creates fallback astrological data when API is unavailable
 * This ensures the horoscope feature still works even if the API is down
 */
function createFallbackAstrologicalData(dateString: string): AstrologicalData {
  const planets: PlanetaryPosition[] = [
    { name: 'Sun', longitude: 0, latitude: 0, sign: 'Aries', isRetrograde: false },
    { name: 'Moon', longitude: 60, latitude: 0, sign: 'Gemini', isRetrograde: false },
    { name: 'Mercury', longitude: 30, latitude: 0, sign: 'Taurus', isRetrograde: false },
    { name: 'Venus', longitude: 90, latitude: 0, sign: 'Cancer', isRetrograde: false },
    { name: 'Mars', longitude: 120, latitude: 0, sign: 'Leo', isRetrograde: false },
    { name: 'Jupiter', longitude: 150, latitude: 0, sign: 'Virgo', isRetrograde: false },
    { name: 'Saturn', longitude: 180, latitude: 0, sign: 'Libra', isRetrograde: false },
    { name: 'Uranus', longitude: 210, latitude: 0, sign: 'Scorpio', isRetrograde: false },
    { name: 'Neptune', longitude: 240, latitude: 0, sign: 'Sagittarius', isRetrograde: false },
    { name: 'Pluto', longitude: 270, latitude: 0, sign: 'Capricorn', isRetrograde: false }
  ];

  return {
    date: dateString,
    planets,
    retrogrades: []
  };
}

/**
 * Clears the cached astrological data
 * Useful for testing or forcing a refresh
 */
export function clearAstrologicalCache(): void {
  cachedAstrologicalData = null;
  cacheDate = null;
}

