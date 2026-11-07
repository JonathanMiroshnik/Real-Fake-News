/**
 * Today's seeded horoscope set: one short text per zodiac sign.
 *
 * The texts are stored by the seeder and served by `/api/horoscopes`, which is
 * the endpoint that otherwise calls `freeastroapi.com` on every cold start. With
 * these rows present, dev never needs the transit API at all.
 *
 * Astrological data is derived from the date (`buildMockAstrologicalData`), so
 * the same day always produces the same sky — no network, no drift.
 */
import { ZODIAC_SIGNS, type AstrologicalData, type ZodiacSign } from '../../../types/horoscope.js';
import type { MockHoroscopeEntry } from './types.js';

export const MOCK_HOROSCOPE_ENTRIES: MockHoroscopeEntry[] = [
  {
    zodiacSign: 'Aries',
    content:
      'You will begin three projects before lunch and finish none of them, and this will be the correct use of your day. Someone will call it "momentum." Accept the compliment.',
  },
  {
    zodiacSign: 'Taurus',
    content:
      'A small comfort you have been rationing is, today, medically necessary. Sit down. Take the good chair. The laundry has waited this long and can wait a little longer.',
  },
  {
    zodiacSign: 'Gemini',
    content:
      'You will tell the same story to two different people and improve it both times. This is not dishonesty, it is editing. Keep the better ending.',
  },
  {
    zodiacSign: 'Cancer',
    content:
      'Someone will ask how you are and actually mean it. Resist the reflex to say "fine." The longer answer is the one worth giving today.',
  },
  {
    zodiacSign: 'Leo',
    content:
      'The room will, briefly, be yours. Use it to say something kind about someone who is standing slightly behind you, where they cannot see it coming.',
  },
  {
    zodiacSign: 'Virgo',
    content:
      'You will find the error. You will also discover that the error has been there for eleven months and nobody died. Fix it quietly and let this be the lesson.',
  },
  {
    zodiacSign: 'Libra',
    content:
      'A decision you have been weighing will be made for you by circumstances, and you will feel an enormous, slightly embarrassing relief. Say thank you.',
  },
  {
    zodiacSign: 'Scorpio',
    content:
      'A suspicion turns out to be correct, which is less satisfying than expected. Keep it to yourself; the satisfaction is in knowing, not in being right out loud.',
  },
  {
    zodiacSign: 'Sagittarius',
    content:
      'You will miss a train and find something better on the later one. Do not tell anyone you planned it. Let them believe in your instincts.',
  },
  {
    zodiacSign: 'Capricorn',
    content:
      'The list gets shorter today, not because you worked harder but because you removed an item and nothing happened. This is a technique. Remember it.',
  },
  {
    zodiacSign: 'Aquarius',
    content:
      'Your unpopular idea is, today, merely early. Write it down properly, with a date, so that in eighteen months you can be gracious about being right.',
  },
  {
    zodiacSign: 'Pisces',
    content:
      'You will be moved by something small — a window, a song in a shop, a stranger being decent. Let it happen. It is not a distraction; it is the material.',
  },
];

/** The bodies the mock transit table reports positions for. */
const MOCK_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'] as const;

/** Deterministic 0–1 value for a string, so the same date always yields the same sky. */
function hashToUnit(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

/**
 * Builds a plausible `AstrologicalData` payload for a `YYYY-MM-DD` date.
 *
 * @param dateIso UTC date, matching the `date` column format used by
 *   `horoscopeService` (`toISOString().split('T')[0]`).
 */
export function buildMockAstrologicalData(dateIso: string): AstrologicalData {
  const planets = MOCK_PLANETS.map((name) => {
    const longitude = Number((hashToUnit(`${dateIso}:${name}`) * 360).toFixed(2));
    const signIndex = Math.floor(longitude / 30) % ZODIAC_SIGNS.length;
    const latitude = Number(((hashToUnit(`${dateIso}:${name}:lat`) - 0.5) * 8).toFixed(2));
    const isRetrograde = hashToUnit(`${dateIso}:${name}:retrograde`) > 0.8;

    return { name, longitude, latitude, sign: ZODIAC_SIGNS[signIndex] as ZodiacSign, isRetrograde };
  });

  return {
    date: dateIso,
    planets,
    retrogrades: planets.filter((planet) => planet.isRetrograde).map((planet) => planet.name),
    notableAspects: ['Sun trine Moon', 'Mars square Jupiter'],
  };
}
