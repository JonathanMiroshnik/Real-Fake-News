/**
 * Reads `CONTENT_SOURCE`, which chooses between the live and mock port sets.
 *
 * Defaults to `live` on purpose. A missing variable must never quietly produce
 * invented content: the dangerous direction is "I forgot to set it and now the
 * database is full of fake articles", not "I forgot to set it and nothing was
 * generated". Production is the case that matters, and there the default is the
 * one that cannot inject fake data.
 *
 * Unset and empty are treated the same, because `CONTENT_SOURCE=` in a compose
 * file is how a variable gets "cleared" in practice.
 */
import './env.js';
import type { ContentSource } from '../types/contentSource.js';
import { LIVE_CONTENT_SOURCE, MOCK_CONTENT_SOURCE } from '../types/contentSource.js';
import { debugWarn } from '../utils/debugLogger.js';

/** Thrown when `CONTENT_SOURCE` holds a value the pipeline cannot honour. */
export class InvalidContentSourceError extends Error {
  constructor(rawValue: string) {
    super(
      `CONTENT_SOURCE="${rawValue}" is not a valid source. Use "${LIVE_CONTENT_SOURCE}" ` +
        `or "${MOCK_CONTENT_SOURCE}".`,
    );
    this.name = 'InvalidContentSourceError';
  }
}

const VALID_SOURCES: readonly ContentSource[] = [LIVE_CONTENT_SOURCE, MOCK_CONTENT_SOURCE];

/**
 * Parses a raw `CONTENT_SOURCE` value.
 *
 * @param rawValue The environment variable, or `undefined` if unset.
 * @returns `'live'` when unset or blank; otherwise the parsed value.
 * @throws {InvalidContentSourceError} If the value is not a known source — a typo
 *   must not silently fall back to either set, because guessing would either
 *   invent content or starve the jobs, and both are hard to notice.
 */
export function parseContentSource(rawValue: string | undefined): ContentSource {
  const trimmed = rawValue?.trim().toLowerCase() ?? '';

  if (trimmed === '') {
    return LIVE_CONTENT_SOURCE;
  }
  if (!VALID_SOURCES.includes(trimmed as ContentSource)) {
    throw new InvalidContentSourceError(rawValue ?? '');
  }

  return trimmed as ContentSource;
}

/** The configured content source for this process. */
export const CONTENT_SOURCE: ContentSource = parseContentSource(process.env.CONTENT_SOURCE);

/** True when mock ports are in use — the pipeline will invent its content. */
export const isMockContentSource = CONTENT_SOURCE === MOCK_CONTENT_SOURCE;

if (isMockContentSource) {
  debugWarn(
    `⚠️  CONTENT_SOURCE=mock — the pipeline is generating INVENTED content. ` +
      `Every row it writes is stamped "${MOCK_CONTENT_SOURCE}". Unset CONTENT_SOURCE to use live sources.`,
  );
}
