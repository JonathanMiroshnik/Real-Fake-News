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
  retrogrades: string[];
  notableAspects?: string[];
}

export interface Horoscope {
  id?: number;
  date: string;
  zodiacSign: string;
  content: string;
  astrologicalData: AstrologicalData;
  createdAt?: string;
}

export interface HoroscopeResponse {
  success: boolean;
  horoscopes?: Horoscope[];
  horoscope?: Horoscope;
  error?: string;
}

export const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces'
] as const;

export type ZodiacSign = typeof ZODIAC_SIGNS[number];

