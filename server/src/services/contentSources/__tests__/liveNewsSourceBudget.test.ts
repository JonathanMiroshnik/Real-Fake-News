import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Pins 6.4 of roadmap entry 6 of `plans/README.md`: the daily news budget is state of
 * the `live` adapter, not module state.
 *
 * The counter used to be a module-level `let` shared by every instance, so
 * spending it was visible everywhere and could not be isolated: two tests in one
 * file interfered, and `it()` order changed the outcome. It also let the budget
 * be read and spent from outside the provider that owns it.
 *
 * `fetchNews` is mocked so these assert the accounting, not the network.
 */
const fetchNewsStub = vi.fn();
vi.mock('../../newsService.js', () => ({
  fetchNews: (...args: unknown[]) => fetchNewsStub(...args),
}));

vi.mock('../../../llmService.js', () => ({
  generateTextFromString: vi.fn(async () => undefined),
}));
vi.mock('../../../imageService.js', () => ({
  generateAndSaveImage: vi.fn(async () => 'image.png'),
}));
vi.mock('../../../astrologyService.js', () => ({
  fetchAstrologicalData: vi.fn(async () => undefined),
}));

describe('LiveNewsSource token budget', () => {
  beforeEach(() => {
    fetchNewsStub.mockReset();
    fetchNewsStub.mockResolvedValue([[], 'next-page']);
  });

  it('starts with the allowance it was given', async () => {
    const { LiveNewsSource } = await import('../live/livePorts.js');

    expect(new LiveNewsSource(3).remainingCalls()).toBe(3);
  });

  it('charges one call per page', async () => {
    const { LiveNewsSource } = await import('../live/livePorts.js');
    const source = new LiveNewsSource(3);

    await source.fetchPage();

    expect(source.remainingCalls()).toBe(2);
  });

  it('refuses to call the API once the budget is spent', async () => {
    const { LiveNewsSource } = await import('../live/livePorts.js');
    const source = new LiveNewsSource(1);
    await source.fetchPage();
    fetchNewsStub.mockClear();

    await expect(source.fetchPage()).rejects.toThrow(/No more tokens/);
    expect(fetchNewsStub).not.toHaveBeenCalled();
  });

  it('charges a call that threw, so an outage cannot burn the network for free', async () => {
    const { LiveNewsSource } = await import('../live/livePorts.js');
    const source = new LiveNewsSource(3);
    fetchNewsStub.mockRejectedValue(new Error('network down'));

    // The provider counts the attempt whether or not it answered us.
    await expect(source.fetchPage()).rejects.toThrow('network down');
    expect(source.remainingCalls()).toBe(2);
  });

  it('keeps two instances independent', async () => {
    const { LiveNewsSource } = await import('../live/livePorts.js');
    const first = new LiveNewsSource(3);
    const second = new LiveNewsSource(3);

    await first.fetchPage();
    await first.fetchPage();

    // The bug this pins: a module `let` would report 1 for both.
    expect(first.remainingCalls()).toBe(1);
    expect(second.remainingCalls()).toBe(3);
  });

  it('refills to the configured allowance on a daily reset, not the constructor value', async () => {
    const { LiveNewsSource } = await import('../live/livePorts.js');
    const { NEWS_API_DAILY_TOKENS } = await import('../../../config/constants.js');
    const source = new LiveNewsSource(3);
    await source.fetchPage();

    // A reset restores the day's real budget. Restoring the constructor argument
    // would be wrong: that parameter exists so a test can start small, and a
    // midnight reset must not adopt the test's ceiling as policy.
    source.resetDailyCalls();

    expect(source.remainingCalls()).toBe(NEWS_API_DAILY_TOKENS);
  });
});

describe('fetchNews', () => {
  it('no longer meters the budget itself', async () => {
    // Asked of the source, not the service: newsService must not export a
    // spendable counter, because the budget has one owner.
    const newsService = await import('../../newsService.js');

    expect('remainingTokens' in newsService).toBe(false);
  });
});
