import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ONE_HOUR_MILLISECS } from '../../config/constants.js';
import type { ScheduledJob } from '../scheduler.js';

/**
 * Pins roadmap entry 8 (`plans/README.md`): one registry, one enable check, and a
 * boot log that names what is active.
 *
 * Every job module is mocked, so no job body reaches `better-sqlite3` (which cannot
 * be built here) or `node-cron`'s real scheduler, and no network call is possible.
 * What is asserted is what a future refactor breaks silently:
 *
 *   - a disabled flag must not register or run anything;
 *   - an enabled one must register every entry, so a job "wired by nothing" (the
 *     horoscope bug) cannot come back without failing this file;
 *   - `if-due` must be asked *before* the boot run, and a complete day must not
 *     re-generate twelve rows per restart.
 */
vi.mock('../../config/env.js', () => ({
  isScheduledJobsEnabled: vi.fn(() => true),
}));

const cronSchedule = vi.fn((_expression: string, _run: () => void) => ({ destroy: vi.fn() }));
vi.mock('node-cron', () => ({ default: { schedule: cronSchedule } }));

const articleSpy = vi.fn(async () => undefined);
const newsSpy = vi.fn(async () => []);
const recipeSpy = vi.fn(async () => undefined);
const featuredSpy = vi.fn(async () => undefined);
const featuredDueSpy = vi.fn(async () => true);
const horoscopeSpy = vi.fn(async () => undefined);
const horoscopeDueSpy = vi.fn(async () => true);

vi.mock('../blogWriting.js', () => ({
  generateScheduledArticles: articleSpy,
  // Half a compressed day; the registry reads it the same way `blogWriting.ts` does.
  HALF_DAY_MILLISECS: 12 * 60 * 60 * 1000,
}));
vi.mock('../newsFetching.js', () => ({ addNewsToTotal: newsSpy }));
vi.mock('../recipeGeneration.js', () => ({ generateScheduledRecipes: recipeSpy }));
vi.mock('../featuredArticleSelection.js', () => ({
  selectDailyFeaturedArticle: featuredSpy,
  isFeaturedArticleDue: featuredDueSpy,
}));
vi.mock('../horoscopeGeneration.js', () => ({
  generateDailyHoroscopes: horoscopeSpy,
  areTodaysHoroscopesDue: horoscopeDueSpy,
}));

/** Every boot run is fire-and-forget; this waits for the pending ones to settle. */
const flushPendingJobs = async (isDueSpy: typeof featuredDueSpy): Promise<void> => {
  await vi.waitFor(() => expect(isDueSpy).toHaveBeenCalled());
  await new Promise((resolve) => setImmediate(resolve));
};

const EXPECTED_JOB_COUNT = 5;

/** The entries that ride the (compressed) midnight cron. */
const DAILY_JOB_NAMES = ['featured', 'horoscopes'];

/**
 * Two entries cover both `if-due` outcomes, so these cases do not depend on how
 * many jobs the real registry happens to hold.
 */
function fakeRegistry(): ScheduledJob[] {
  return [
    {
      name: 'featured',
      schedule: { kind: 'cron', expression: '0 0 * * *' },
      runOnBoot: 'if-due',
      isDue: featuredDueSpy,
      run: featuredSpy,
    },
    {
      name: 'horoscopes',
      schedule: { kind: 'cron', expression: '0 0 * * *' },
      runOnBoot: 'if-due',
      isDue: horoscopeDueSpy,
      run: horoscopeSpy,
    },
  ];
}

describe('startScheduler', () => {
  let scheduler: typeof import('../scheduler.js');
  let jobs: typeof import('../featuredArticleSelection.js') &
    typeof import('../horoscopeGeneration.js');

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    const { isScheduledJobsEnabled } = await import('../../config/env.js');
    // `clearAllMocks` also drops the factory's `() => true`, so re-arm it here.
    vi.mocked(isScheduledJobsEnabled).mockReturnValue(true);
    scheduler = await import('../scheduler.js');
    jobs = {
      ...(await import('../featuredArticleSelection.js')),
      ...(await import('../horoscopeGeneration.js')),
    };
  });

  it('registers this many cron entries when enabled', async () => {
    const stop = scheduler.startScheduler(fakeRegistry());
    stop();

    expect(cronSchedule).toHaveBeenCalledTimes(2);
    const expressions = cronSchedule.mock.calls.map((call) => call[0]);
    expect(expressions).toEqual(['0 0 * * *', '0 0 * * *']);
  });

  it('registers nothing and runs nothing when disabled', async () => {
    const { isScheduledJobsEnabled } = await import('../../config/env.js');
    vi.mocked(isScheduledJobsEnabled).mockReturnValue(false);

    const stop = scheduler.startScheduler(fakeRegistry());
    await new Promise((resolve) => setImmediate(resolve));
    stop();

    expect(cronSchedule).not.toHaveBeenCalled();
    expect(jobs.isFeaturedArticleDue).not.toHaveBeenCalled();
    expect(jobs.areTodaysHoroscopesDue).not.toHaveBeenCalled();
    expect(jobs.selectDailyFeaturedArticle).not.toHaveBeenCalled();
    expect(jobs.generateDailyHoroscopes).not.toHaveBeenCalled();
  });

  it('does not run an if-due job on boot while today’s output exists', async () => {
    vi.mocked(jobs.isFeaturedArticleDue).mockResolvedValue(false);

    const stop = scheduler.startScheduler(fakeRegistry());
    await flushPendingJobs(vi.mocked(jobs.isFeaturedArticleDue));
    stop();

    expect(jobs.isFeaturedArticleDue).toHaveBeenCalledTimes(1);
    expect(jobs.selectDailyFeaturedArticle).not.toHaveBeenCalled();
  });

  it('runs an if-due job on boot when it is due', async () => {
    vi.mocked(jobs.areTodaysHoroscopesDue).mockResolvedValue(true);

    const stop = scheduler.startScheduler(fakeRegistry());
    await flushPendingJobs(vi.mocked(jobs.areTodaysHoroscopesDue));
    stop();

    expect(jobs.generateDailyHoroscopes).toHaveBeenCalledTimes(1);
  });
});

describe('real registry', () => {
  afterEach(() => {
    vi.resetModules();
    delete process.env.JOBS_TIME_SCALE;
  });

  it('holds five uniquely named entries, with a due-check on every if-due job', async () => {
    vi.resetModules();
    const { buildJobRegistry } = await import('../scheduler.js');

    const jobs = buildJobRegistry();
    const names = jobs.map((job) => job.name);

    expect(jobs).toHaveLength(EXPECTED_JOB_COUNT);
    expect(new Set(names).size).toBe(EXPECTED_JOB_COUNT);
    expect(names).toContain('horoscopes');
    for (const job of jobs) {
      const needsDueCheck = job.runOnBoot === 'if-due';
      expect(Boolean(job.isDue)).toBe(needsDueCheck);
    }
  });

  it('keeps real midnight when the schedule is not compressed', async () => {
    vi.resetModules();
    const { buildJobRegistry } = await import('../scheduler.js');

    const dailyJobs = buildJobRegistry().filter((job) => DAILY_JOB_NAMES.includes(job.name));

    expect(dailyJobs).toHaveLength(DAILY_JOB_NAMES.length);
    for (const job of dailyJobs) {
      expect(job.schedule).toEqual({ kind: 'cron', expression: '0 0 * * *' });
    }
  });

  it('compresses the midnight crons with the compressed day', async () => {
    vi.resetModules();
    process.env.JOBS_TIME_SCALE = '60';
    const { buildJobRegistry } = await import('../scheduler.js');

    const dailyJobs = buildJobRegistry().filter((job) => DAILY_JOB_NAMES.includes(job.name));

    // A compressed day is 24 minutes long at scale 60, so every simulated midnight
    // is 24 wall-clock minutes. Waiting for the real one was the bug.
    for (const job of dailyJobs) {
      expect(job.schedule).toEqual({ kind: 'cron', expression: '*/24 * * * *' });
    }
  });

  it('schedules every job on a cron, none on a random interval', async () => {
    vi.resetModules();
    const { buildJobRegistry } = await import('../scheduler.js');

    const schedules = buildJobRegistry().map((job) => job.schedule.kind);

    // Content is produced here and consumed by the REST routes, so a jittered start
    // time is invisible to the reader and costs determinism for nothing.
    expect(schedules).toEqual(['cron', 'cron', 'cron', 'cron', 'cron']);
  });

  it('runs news fetching, article writing and recipes on a fixed grid', async () => {
    vi.resetModules();
    const { buildJobRegistry } = await import('../scheduler.js');

    const expressions = Object.fromEntries(
      buildJobRegistry().map((job) => [job.name, job.schedule.expression]),
    );

    // Uncompressed: a 2-hourly fetch, a twice-daily write, a once-daily recipe run.
    expect(expressions).toMatchObject({
      'news-fetch': '0 */2 * * *',
      'article-writing': '0 */12 * * *',
      'recipe-generation': '0 0 * * *',
    });
  });

  it('compresses the fixed grid too, so a dev day is not a real 12-hour wait', async () => {
    vi.resetModules();
    process.env.JOBS_TIME_SCALE = '24';
    const { buildJobRegistry } = await import('../scheduler.js');

    const expressions = Object.fromEntries(
      buildJobRegistry().map((job) => [job.name, job.schedule.expression]),
    );

    // 2h / 24 = 5 minutes, 12h / 24 = 30 minutes, 24h / 24 = hourly.
    expect(expressions['news-fetch']).toBe('*/5 * * * *');
    expect(expressions['article-writing']).toBe('*/30 * * * *');
    expect(expressions['recipe-generation']).toBe('0 * * * *');
  });

  it('runs the writing job once per window it counts its quota over', async () => {
    vi.resetModules();
    const { HALF_DAY_MILLISECS } = await import('../blogWriting.js');

    for (const scale of ['1', '24']) {
      process.env.JOBS_TIME_SCALE = scale;
      vi.resetModules();
      const { buildJobRegistry } = await import('../scheduler.js');
      const writing = buildJobRegistry().find((job) => job.name === 'article-writing');

      // The window is what decides "how many articles did this pipeline write today".
      // If the schedule drifts finer than the window, every run re-counts the same
      // articles and the quota looks met while the day stays empty.
      const scaledWindowHours = HALF_DAY_MILLISECS / Number(scale) / ONE_HOUR_MILLISECS;
      expect(writing?.schedule.expression).toBe(
        scaledWindowHours % 1 === 0
          ? `0 */${scaledWindowHours} * * *`
          : `*/${Math.round(scaledWindowHours * 60)} * * * *`,
      );
    }
  });
});
