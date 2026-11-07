/**
 * Everything a single seed run needs, created once and passed to each table
 * seeder.
 *
 * `now` is fixed for the whole run: every mock row stores `hoursAgo` relative to
 * one instant, so the seeded week never has gaps or overlaps caused by the run
 * straddling a minute boundary.
 */
import type { SeedOptions } from './seedOptions.js';
import type { SeedReport } from './seedReport.js';

/** Shared state for one seed run. */
export interface SeedContext {
  /** Parsed CLI flags (--reset / --force / --seed). */
  options: SeedOptions;
  /** Seeded PRNG in [0, 1) — identical seed ⇒ identical placeholder images. */
  random: () => number;
  /** Counters; each seeder increments the fields it owns. */
  report: SeedReport;
  /** Publication instant for the whole run. */
  now: Date;
}

/**
 * Formats "N hours before the run started" as an ISO timestamp.
 *
 * @param context the run context.
 * @param hoursAgo 0 = right now, 168 = a week ago.
 */
export function hoursAgoToIso(context: SeedContext, hoursAgo: number): string {
  const offsetMs = hoursAgo * 60 * 60 * 1000;
  return new Date(context.now.getTime() - offsetMs).toISOString();
}

/** UTC `YYYY-MM-DD`, the format `horoscopeService` stores and queries. */
export function toHoroscopeDate(context: SeedContext): string {
  return context.now.toISOString().split('T')[0];
}
