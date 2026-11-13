/**
 * The one place that says what the server schedules, how often, and what runs
 * when the process starts.
 *
 * Job bodies stay in their own modules (`blogWriting.ts`, `newsFetching.ts`,
 * `recipeGeneration.ts`, `featuredArticleSelection.ts`, `horoscopeGeneration.ts`);
 * this file only decides when they are called. Before the registry existed, three
 * jobs were wired here and two registered their own `node-cron` tasks from inside
 * the job modules — so the featured hero and the horoscopes waited for a real
 * midnight even when `JOBS_TIME_SCALE` compressed every other window, and the
 * horoscope job was registered by nothing at all.
 */
import { isScheduledJobsEnabled } from '../config/env.js';
import { DAY_MILLISECS } from '../config/constants.js';
import { JOBS_TIME_SCALE } from '../services/contentSources/index.js';
import { debugLog, debugWarn } from '../utils/debugLogger.js';
import { generateScheduledArticles, HALF_DAY_MILLISECS } from './blogWriting.js';
import { addNewsToTotal } from './newsFetching.js';
import { generateScheduledRecipes } from './recipeGeneration.js';
import { isFeaturedArticleDue, selectDailyFeaturedArticle } from './featuredArticleSelection.js';
import { areTodaysHoroscopesDue, generateDailyHoroscopes } from './horoscopeGeneration.js';
import {
  startCronSchedule,
  type JobBody,
  type JobSchedule,
  type StopSchedule,
} from './registryTimers.js';

/** When a job runs on boot, besides its schedule. */
export type RunOnBoot =
  /** Run it immediately: a fresh database would otherwise stay empty until the first tick. */
  | 'always'
  /** Run it only if today's output is missing — the guard against 12 LLM calls per restart. */
  | 'if-due'
  /** Only on its schedule. */
  | 'never';

/** One scheduled job. */
export interface ScheduledJob {
  /** Stable name, used in the boot log (`registered horoscopes`). */
  name: string;
  schedule: JobSchedule;
  runOnBoot: RunOnBoot;
  /** The job body. */
  run: JobBody;
  /** For `runOnBoot: 'if-due'` — resolves `true` when today's output is missing. */
  isDue?: () => Promise<boolean>;
}

/** A running scheduler: stops every registered job and clears its timers. */
export type SchedulerHandle = StopSchedule;

/** How often each job runs, before `JOBS_TIME_SCALE` compresses it. */
const NEWS_FETCH_INTERVAL_HOURS = 2;
/**
 * Twice a day, not three times: the window this job measures its quota over comes
 * from `blogWriting.ts` (`HALF_DAY_MILLISECS`, itself scaled), so a run more often
 * than the window would only count the same articles again.
 */
const ARTICLE_WRITING_INTERVAL_HOURS = 12;
const NEWS_ARTICLES_TO_ADD = 10;

/** Midnight, every day — the two jobs that operate on one editorial day. */
const DAILY_CRON_EXPRESSION = '0 0 * * *';

/** Seconds in a day; one real day is `day / JOBS_TIME_SCALE` long on the compressed clock. */
const SECONDS_PER_DAY = 24 * 60 * 60;
const MINUTES_PER_HOUR = 60;

/** Compresses a window by `JOBS_TIME_SCALE` — see the constant's docs. */
function scaledInterval(intervalMillis: number): number {
  return intervalMillis / JOBS_TIME_SCALE;
}

/**
 * An hourly cron, squeezed onto the compressed clock.
 *
 * The three near-real-time jobs used to run on a random interval; they now run on a
 * fixed grid, because their timing cannot reach the reader anyway (content is
 * produced here and consumed by the REST routes — see "Producer-Consumer model" in
 * `contracts/architecture.md`). Determinism is the point: "articles are written twice
 * a day" is now a sentence you can check against `cron` rather than a distribution
 * you have to measure.
 *
 * `JOBS_TIME_SCALE` still compresses it, because a compressed dev day should not mean
 * waiting a real half-day. Whole scaled hours use cron's hour field (`0 *∕8 * * *`);
 * anything finer becomes a minute step (`*∕5 * * * *`).
 *
 * @param hours Spacing on the real clock.
 * @returns An expression that fires every `hours / scale`.
 */
function compressedHourlyCronExpression(hours: number): string {
  const scaledHours = hours / JOBS_TIME_SCALE;
  const roundedHours = Math.round(scaledHours);
  const isWholeHours = Math.abs(scaledHours - roundedHours) < 1e-9;

  if (scaledHours >= 1 && isWholeHours) return `0 */${roundedHours} * * *`;

  const scaledMinutes = Math.max(1, Math.round(scaledHours * MINUTES_PER_HOUR));
  return `*/${scaledMinutes} * * * *`;
}

/**
 * The daily cron, squeezed onto the compressed clock.
 *
 * A `0 0 * * *` expression fires by the wall clock, which `JOBS_TIME_SCALE` cannot
 * touch — so at scale 60 the hero and the horoscopes still waited a real midnight.
 * On the compressed clock a simulated day lasts `24h / scale`, so the cron fires
 * every thinned-out hour (scale 24 → hourly, 60 → every 24 minutes); the `if-due`
 * guards and `INSERT OR REPLACE` upserts make an extra tick a no-op rather than a
 * duplicate.
 *
 * @returns An expression that fires at least once per simulated day.
 */
function compressedDailyCronExpression(): string {
  if (JOBS_TIME_SCALE === 1) return DAILY_CRON_EXPRESSION;

  const compressedDayMinutes = SECONDS_PER_DAY / JOBS_TIME_SCALE / MINUTES_PER_HOUR;
  if (compressedDayMinutes >= MINUTES_PER_HOUR) return '0 * * * *'; // hourly
  if (compressedDayMinutes >= 1) {
    const stepMinutes = Math.max(1, Math.floor(compressedDayMinutes));
    return `*/${stepMinutes} * * * *`;
  }

  // A day shorter than a minute: every second is the finest node-cron offers.
  return '* * * * * *';
}

/**
 * TODO: 11 November 2026 - the timings below are still hard-coded. They should come
 * from a `schedule` table (or `site_config` rows) editable in the admin panel: one
 * row per entry, holding the cron expression, the random-jitter width, and whether
 * it runs on boot. The registry is the seam for that — swapping `buildJobRegistry()`
 * for a database read should not touch the jobs themselves.
 *
 * Status, November 2026 — not done, and now one item smaller:
 * - The registry *is* the seam: `startScheduler(jobs = buildJobRegistry())` accepts any
 *   list, so a database read only has to produce `ScheduledJob[]`.
 * - "the random-jitter width" no longer applies. Nothing is jittered any more; the three
 *   near-real-time jobs run on a fixed cron grid. Roadmap entry 14 in
 *   `plans/README.md` is where jitter would come back, and only for a reason (provider
 *   rate limits), not for its own sake.
 * - "whether it runs on boot" already exists as `ScheduledJob.runOnBoot`, but it is a
 *   code literal per entry, not a stored value the admin can change.
 * - Still open: the timings below are still `const`s in this file, and
 *   `DEFAULT_CONFIG.articleGenerationIntervalHours` / `newsFetchIntervalHours`
 *   (`config/constants.ts`) are read by nothing, so editing them in the admin panel
 *   changes no schedule.
 */

/**
 * The registry. Five entries, in boot order.
 *
 * Three jobs run on a fixed hourly grid (`NEWS_FETCH_INTERVAL_HOURS` and friends) and
 * two on the midnight cron; nothing is jittered. The grid replaced a random interval
 * because the timing was never observable: the jobs fill the database and the REST
 * routes serve it, and no reader can tell a 2h gap from a 2h17m gap — only the
 * scheduler's own logs could. Roadmap entry 14 in `plans/README.md` records the
 * idea, and treats it as a provider-rate-limit concern rather than a scheduling one.
 *
 * Every interval is scaled by `JOBS_TIME_SCALE`, and so is every quota window the
 * jobs measure their output over (`blogWriting.ts`, `recipeGeneration.ts`): with
 * only the timers scaled, one fast cycle fills a day's quota and the run idles.
 * The two midnight crons are compressed the same way — at `JOBS_TIME_SCALE=60` they
 * fire every 24 minutes, which is what makes a compressed dev day show a day's
 * worth of heroes and horoscopes instead of waiting for real midnight.
 *
 * `article-writing` runs twice a day, on exactly the window it counts its quota
 * over (`HALF_DAY_MILLISECS`), and `recipe-generation` runs once — each run
 * early-returns once its quota is met, so a fixed grid cannot over-produce.
 */
export function buildJobRegistry(): ScheduledJob[] {
  const dailyCron: JobSchedule = {
    kind: 'cron',
    expression: compressedDailyCronExpression(),
  };
  const writingWindow = scaledInterval(HALF_DAY_MILLISECS);

  return [
    {
      name: 'news-fetch',
      schedule: cronScheduleForHours(NEWS_FETCH_INTERVAL_HOURS),
      runOnBoot: 'always',
      run: async () => {
        await addNewsToTotal(NEWS_ARTICLES_TO_ADD);
      },
    },
    {
      name: 'article-writing',
      schedule: cronScheduleForHours(ARTICLE_WRITING_INTERVAL_HOURS),
      runOnBoot: 'always',
      run: () => generateScheduledArticles(writingWindow),
    },
    {
      name: 'recipe-generation',
      schedule: dailyCron,
      runOnBoot: 'always',
      run: () => generateScheduledRecipes(scaledInterval(DAY_MILLISECS)),
    },
    {
      name: 'featured',
      schedule: dailyCron,
      runOnBoot: 'if-due',
      isDue: isFeaturedArticleDue,
      run: () => selectDailyFeaturedArticle(),
    },
    {
      name: 'horoscopes',
      schedule: dailyCron,
      runOnBoot: 'if-due',
      isDue: areTodaysHoroscopesDue,
      run: () => generateDailyHoroscopes(),
    },
  ];
}
/**
 * A fixed grid every `hours` hours on the real clock, compressed by `JOBS_TIME_SCALE`.
 *
 * @param hours Spacing on the real clock; must be positive.
 * @returns The schedule entry for the registry.
 */
function cronScheduleForHours(hours: number): JobSchedule {
  return {
    kind: 'cron',
    expression: compressedHourlyCronExpression(hours),
  };
}

/** Registers `job` and returns the handle that stops it. */
function registerJob(job: ScheduledJob): StopSchedule {
  return startCronSchedule(job.schedule.expression, job.run);
}

/**
 * Runs the boot-time half of an entry, if it is due.
 *
 * Never throws: a job that cannot run on boot is logged and the scheduler carries
 * on, because one broken job must not keep the HTTP server from starting.
 */
async function runOnBootIfDue(job: ScheduledJob): Promise<void> {
  if (job.runOnBoot === 'never') return;

  if (job.runOnBoot === 'if-due' && job.isDue) {
    const isDue = await job.isDue().catch((error: unknown) => {
      console.error(`❌ ${job.name}: could not check whether it is due:`, error);
      return false;
    });
    if (!isDue) {
      debugLog(`⏭️  skipped ${job.name} on boot (today's output already exists)`);
      return;
    }
  }

  try {
    await job.run();
  } catch (error) {
    console.error(`❌ ${job.name} failed on boot:`, error);
  }
}

/**
 * Starts the scheduler: one enable check, then every entry in the registry.
 *
 * Called from `index.ts` after the database is open, never at module scope of
 * `app.ts`: a test that imported the app used to start real timers — and, with
 * keys present, real API calls.
 *
 * @param jobs The registry to start; defaults to `buildJobRegistry()`. Tests pass a
 *   fake registry so no job body (`better-sqlite3`, the network) is ever reached.
 * @returns A handle that stops every job; call it on shutdown.
 */
export function startScheduler(jobs: ScheduledJob[] = buildJobRegistry()): SchedulerHandle {
  if (!isScheduledJobsEnabled()) {
    debugWarn('⏸️  Scheduled jobs are disabled (ENABLE_SCHEDULED_JOBS is not "true")');
    return () => undefined;
  }

  const stopHandles = jobs.map((job) => {
    const stopSchedule = registerJob(job);
    debugLog(`✅ registered ${job.name} (${describeSchedule(job.schedule)})`);
    void runOnBootIfDue(job);
    return stopSchedule;
  });

  let isStopped = false;
  return () => {
    if (isStopped) return;
    isStopped = true;
    stopHandles.forEach((stopSchedule) => stopSchedule());
    debugLog(`🛑 scheduler stopped (${jobs.length} jobs)`);
  };
}

/** Human-readable schedule, for the boot log. */
function describeSchedule(schedule: JobSchedule): string {
  return `cron ${schedule.expression}`;
}
