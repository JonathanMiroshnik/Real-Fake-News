/**
 * Colour bands for the Slop meter bar.
 *
 * Kept out of `SlopMeter.tsx` so that file exports only a component (the
 * `react-refresh` lint rule) and the bands can be unit-tested on their own.
 */

const LOW_INTELLIGENCE_MAX = 33;
const MEDIUM_INTELLIGENCE_MAX = 66;

export const SLOP_METER_TONE = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export type SlopMeterTone = (typeof SLOP_METER_TONE)[keyof typeof SLOP_METER_TONE];

/**
 * Maps a 0–100 intelligence score onto its colour band.
 *
 * Bands are contiguous and closed, so every number has exactly one answer:
 * red ≤ 33, yellow 34–66, green 67–100. Two branches suffice because the second
 * test is only reached above 33; a separate `>= 67` test would be unreachable
 * and existed only to make that obvious.
 *
 * @param intelligence Percentage reported by the backend.
 * @returns The tone whose CSS class colours the bar.
 */
export function getSlopMeterTone(intelligence: number): SlopMeterTone {
  if (intelligence <= LOW_INTELLIGENCE_MAX) {
    return SLOP_METER_TONE.LOW;
  }

  if (intelligence <= MEDIUM_INTELLIGENCE_MAX) {
    return SLOP_METER_TONE.MEDIUM;
  }

  return SLOP_METER_TONE.HIGH;
}
