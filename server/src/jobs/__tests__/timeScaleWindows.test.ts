import { describe, it, expect, vi } from 'vitest';

/**
 * `JOBS_TIME_SCALE` compresses the *windows* the jobs measure output over, not
 * just the timers. The distinction is the whole point of the feature: with only
 * the timers scaled, one fast cycle fills a day's quota and the run then idles
 * for 23 hours while claiming to show a day of activity.
 *
 * The scale is read once, at import time, so each case re-imports the job with
 * `vi.resetModules()` and a fresh env value.
 */
const RECENT_NEWS_WINDOW_MILLIS = 24 * 60 * 60 * 1000;

describe('generateScheduledArticles recency window', () => {
  it('looks back a real 24 hours when the schedule is not scaled', async () => {
    const cutoffs: Date[] = [];
    vi.resetModules();
    delete process.env.JOBS_TIME_SCALE;

    vi.doMock('../../services/newsService.js', () => ({
      getAllNewsArticlesAfterDate: async (since: Date) => {
        cutoffs.push(since);
        return [];
      },
    }));
    vi.doMock('../../services/blogService.js', () => ({
      getAllPostsAfterDate: vi.fn(async () => ({ articles: [] })),
      writeBlogPost: vi.fn(async () => undefined),
    }));

    const { generateScheduledArticles } = await import('../blogWriting.js');
    const before = Date.now();
    await generateScheduledArticles(RECENT_NEWS_WINDOW_MILLIS);

    // The job samples `Date.now()` after us, so its cutoff can be a few ms
    // later than ours; the tolerance is for that skew, not for the window.
    const lookedBackMillis = before - cutoffs[0].getTime();
    expect(lookedBackMillis).toBeCloseTo(RECENT_NEWS_WINDOW_MILLIS, -3);
  });

  it('looks back 24h ÷ scale when the schedule is compressed', async () => {
    const cutoffs: Date[] = [];
    vi.resetModules();
    process.env.JOBS_TIME_SCALE = '60';

    vi.doMock('../../services/newsService.js', () => ({
      getAllNewsArticlesAfterDate: async (since: Date) => {
        cutoffs.push(since);
        return [];
      },
    }));
    vi.doMock('../../services/blogService.js', () => ({
      getAllPostsAfterDate: vi.fn(async () => ({ articles: [] })),
      writeBlogPost: vi.fn(async () => undefined),
    }));

    const { generateScheduledArticles } = await import('../blogWriting.js');
    const before = Date.now();
    await generateScheduledArticles(RECENT_NEWS_WINDOW_MILLIS / 60);

    // 24h ÷ 60 = 24min, against 24h unscaled: any tolerance below that gap still
    // proves the window was divided.
    const expectedLookBack = RECENT_NEWS_WINDOW_MILLIS / 60;
    const lookedBackMillis = before - cutoffs[0].getTime();
    expect(lookedBackMillis).toBeGreaterThanOrEqual(expectedLookBack);
    expect(lookedBackMillis).toBeLessThan(expectedLookBack + 60_000);
  });
});

describe('generateScheduledArticles quota', () => {
  it('asks for no articles when the already-written quota is met', async () => {
    vi.resetModules();
    delete process.env.JOBS_TIME_SCALE;

    const writeBlogPost = vi.fn(async () => undefined);
    vi.doMock('../../services/newsService.js', () => ({
      getAllNewsArticlesAfterDate: vi.fn(async () => []),
    }));
    vi.doMock('../../services/blogService.js', () => ({
      getAllPostsAfterDate: vi.fn(async () => ({ articles: new Array(10).fill({}) })),
      writeBlogPost,
    }));

    const { generateScheduledArticles } = await import('../blogWriting.js');
    await generateScheduledArticles(RECENT_NEWS_WINDOW_MILLIS);

    expect(writeBlogPost).not.toHaveBeenCalled();
  });
});
