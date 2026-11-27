/**
 * Generation status: when did a producer last commit anything, and is the gap
 * small enough that one is plausibly still working on the next edition?
 *
 * Read-only by construction. The header indicator needs to know whether the site
 * is *about to* change, not to make it change, and
 * `contracts/architecture.md` keeps the producer pipelines off client routes.
 * This module reads one row and writes nothing.
 *
 * The fact itself is recorded on the write side: `insert()` calls `markGeneration()`
 * after every committed `blog_posts` / `recipes` row, and `saveHoroscopes()` does
 * the same for horoscopes. Asking the producers "did you write?" by scanning three
 * `MAX(createdAt)` values would be inference; this is the answer.
 *
 * The rule (agreed with the owner): the indicator is only allowed to say
 * "next edition in progress" while the gap since the last write is shorter than
 * the cadence of the article-writing job. Past that cadence, silence is the
 * normal gap between editions, not work in progress — claiming otherwise would
 * leave the light yellow for most of the day, because the job runs every 12h.
 */
import { getDatabase } from '../lib/database/database.js';
import { ARTICLE_WRITING_CADENCE_MILLISECS } from '../config/constants.js';

/** The `generation_status` row written by `markGeneration()`. */
export const LAST_GENERATION_KEY = 'lastGenerationAt';

/** What the client sees. `lastGeneratedAt` is `null` when nothing was ever written. */
export interface GenerationStatus {
  lastGeneratedAt: string | null;
  isGenerating: boolean;
}

/** The recorded write time, or `null` when the row is absent or unreadable. */
function readLastGenerationAt(): string | null {
  const db = getDatabase();
  const row = db
    .prepare(`SELECT value FROM generation_status WHERE key = ?`)
    .get(LAST_GENERATION_KEY) as { value?: string | null } | undefined;

  return row?.value ?? null;
}

/**
 * Parses a stored timestamp.
 *
 * Three shapes exist in practice and only one parses correctly on its own:
 * - `2026-11-17T13:20:49.123Z` — the new default, ISO 8601 UTC.
 * - `2026-11-17T13:20:49.000Z` — what the insert paths write.
 * - `2026-11-17 13:20:49` — SQLite's `CURRENT_TIMESTAMP`, UTC **without** a zone,
 *   which `new Date()` would read as local time. Rows written before the default
 *   changed still carry it, so it is normalised here rather than trusted.
 */
export function parseStoredTimestamp(value: string | null): Date | null {
  if (!value) return null;

  const legacyUtcMatch = value.match(/^(\d{4}-\d{2}-\d{2})[ ](\d{2}:\d{2}:\d{2})$/);
  const candidate = legacyUtcMatch ? `${legacyUtcMatch[1]}T${legacyUtcMatch[2]}Z` : value;
  const parsedDate = new Date(candidate);

  const isValid = !Number.isNaN(parsedDate.getTime());
  return isValid ? parsedDate : null;
}

/**
 * The header's generation-status answer.
 *
 * `isGenerating` is deliberately conservative: an empty database reports `false`,
 * because a site with no content is broken, not busy.
 */
export function readGenerationStatus(now: Date = new Date()): GenerationStatus {
  const lastWrittenAt = parseStoredTimestamp(readLastGenerationAt());

  if (!lastWrittenAt) {
    return { lastGeneratedAt: null, isGenerating: false };
  }

  // A timestamp in the future would make the gap negative; treat it as "now"
  // rather than reporting a freshness the clock cannot support.
  const clampedAt = lastWrittenAt.getTime() > now.getTime() ? now : lastWrittenAt;
  const gapMilliseconds = now.getTime() - clampedAt.getTime();
  const isWithinCadence = gapMilliseconds < ARTICLE_WRITING_CADENCE_MILLISECS;

  return {
    lastGeneratedAt: clampedAt.toISOString(),
    isGenerating: isWithinCadence,
  };
}
