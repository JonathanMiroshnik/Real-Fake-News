/**
 * The one place that decides which port set the pipeline runs on.
 *
 * Everything else in the pipeline asks this module for its ports rather than
 * importing a network client directly, so "does this run against real APIs?" is
 * answered by one environment variable instead of by following six imports.
 *
 * The ports are built once and exported as a single object. Building them per
 * call would be wrong for the live set: `LiveNewsSource` reads a shared token
 * budget, and a fresh instance per job would make the budget look unlimited.
 *
 * Callers should read `ports` rather than `configuredContentSource` when the
 * question is "where does my row come from" — each port carries its own marker,
 * and that marker is what ends up in the database.
 */
import type { ContentPorts } from '../../types/contentPorts.js';
import type { ContentSource } from '../../types/contentSource.js';
import { CONTENT_SOURCE, isMockContentSource } from '../../config/contentSource.js';
import { debugWarn } from '../../utils/debugLogger.js';
import {
  LiveImageGenerator,
  LiveNewsSource,
  LiveTextGenerator,
  LiveTransitSource,
} from './live/livePorts.js';
import {
  MockImageGenerator,
  MockNewsSource,
  MockTextGenerator,
  MockTransitSource,
} from './mocks/mockPorts.js';

/** The scale used when `JOBS_TIME_SCALE` is unset — the real schedule. */
const DEFAULT_JOBS_TIME_SCALE = 1;

/** Thrown when `JOBS_TIME_SCALE` is not a positive number. */
export class InvalidJobsTimeScaleError extends Error {
  constructor(rawValue: string) {
    super(
      `JOBS_TIME_SCALE="${rawValue}" is not a positive number. Leave it unset for the ` +
        `real schedule, or set it to a value like 60 to run the schedule 60× faster.`,
    );
    this.name = 'InvalidJobsTimeScaleError';
  }
}

/**
 * Parses a raw `JOBS_TIME_SCALE` value.
 *
 * @param rawValue The environment variable, or `undefined` if unset.
 * @returns `1` when unset or blank; otherwise the parsed positive number.
 * @throws {InvalidJobsTimeScaleError} If the value is not a finite positive number.
 */
export function parseJobsTimeScale(rawValue: string | undefined): number {
  const trimmed = rawValue?.trim() ?? '';

  if (trimmed === '') {
    return DEFAULT_JOBS_TIME_SCALE;
  }

  const parsedValue = Number(trimmed);
  const isValidScale = Number.isFinite(parsedValue) && parsedValue > 0;
  if (!isValidScale) {
    throw new InvalidJobsTimeScaleError(rawValue ?? '');
  }

  return parsedValue;
}

/** The configured source name, re-exported so callers need only one import. */
export const configuredContentSource: ContentSource = CONTENT_SOURCE;

/**
 * Multiplier applied to every scheduler interval and quota window
 * (`JOBS_TIME_SCALE`).
 *
 * Defaults to `1` — production scheduling is untouched. A value above 1
 * (`JOBS_TIME_SCALE=60`) compresses the schedule, so eight hours of article
 * generation happen in eight minutes and a week of job behaviour is observable in
 * a coffee break. Intervals *and* the history windows the quotas are counted over
 * are divided by it, so a compressed run produces the same number of rows per
 * cycle a real day would, just sooner; scaling the timers alone would fill a
 * day's quota in one cycle and then leave the run idle.
 *
 * A zero, negative or non-numeric value is a configuration error and throws, for
 * the same reason `CONTENT_SOURCE` does not guess: a typo that silently means "1"
 * would look identical to a scheduler that is not running.
 */
export const JOBS_TIME_SCALE: number = parseJobsTimeScale(process.env.JOBS_TIME_SCALE);

if (JOBS_TIME_SCALE !== DEFAULT_JOBS_TIME_SCALE) {
  debugWarn(
    `⚠️  JOBS_TIME_SCALE=${JOBS_TIME_SCALE} — scheduler intervals are compressed ${JOBS_TIME_SCALE}×. ` +
      `Unset it to run on the real schedule.`,
  );
}


function buildLivePorts(): ContentPorts {
  return {
    news: new LiveNewsSource(),
    text: new LiveTextGenerator(),
    image: new LiveImageGenerator(),
    transit: new LiveTransitSource(),
  };
}

function buildMockPorts(): ContentPorts {
  return {
    news: new MockNewsSource(),
    text: new MockTextGenerator(),
    image: new MockImageGenerator(),
    transit: new MockTransitSource(),
  };
}

/**
 * The port set for this process.
 *
 * Selected by `CONTENT_SOURCE` once, at import time, so every consumer in one
 * run agrees. Mixing sets within a run would stamp `mock` rows with images from
 * the live generator (or vice versa), which is the one thing the marker exists to
 * make impossible.
 */
export const ports: ContentPorts = isMockContentSource ? buildMockPorts() : buildLivePorts();
