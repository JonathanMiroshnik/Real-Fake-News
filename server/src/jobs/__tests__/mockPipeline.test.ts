import { describe, it, expect, vi, beforeAll } from 'vitest';
import type { ContentPorts } from '../../types/contentPorts.js';

/**
 * Proves the jobs reach the content pipeline through the ports and nowhere else.
 *
 * `better-sqlite3` is mocked because this sandbox has no C++ toolchain, so the
 * native binding cannot be built. The stub returns an empty row set for every
 * query — enough for a job to run to completion without writing anything — so the
 * assertions are about which *services* were called, not about the rows.
 *
 * What this pins down is the thing a refactor breaks silently: a job that still
 * imported `llmService` or `imageService` directly would call the live stub
 * instead of the mock port and the spy assertions would fail. The ports
 * themselves are covered by `mockPorts.test.ts`.
 */
const emptyStatement = {
  get: () => undefined,
  all: () => [],
  run: () => ({ changes: 0 }),
};

vi.mock('better-sqlite3', () => ({
  default: class DatabaseStub {
    pragma(): void {}
    prepare(): typeof emptyStatement {
      return emptyStatement;
    }
    exec(): void {}
    close(): void {}
  },
}));

describe('jobs against the mock content source', () => {
  let mockPorts: ContentPorts;
  let llmService: typeof import('../../services/llmService.js');
  let imageService: typeof import('../../services/imageService.js');

  beforeAll(async () => {
    const { MockImageGenerator, MockNewsSource, MockTextGenerator, MockTransitSource } =
      await import('../../services/contentSources/mocks/mockPorts.js');

    mockPorts = {
      news: new MockNewsSource(),
      text: new MockTextGenerator(),
      image: new MockImageGenerator(),
      transit: new MockTransitSource(),
    };
    llmService = await import('../../services/llmService.js');
    imageService = await import('../../services/imageService.js');
  });

  it('generateDailyHoroscopes reads transits and prose from the ports', async () => {
    const { generateDailyHoroscopes } = await import('../horoscopeGeneration.js');
    const transitSpy = vi.spyOn(mockPorts.transit, 'fetchTransits');
    const textSpy = vi.spyOn(mockPorts.text, 'generate');

    await generateDailyHoroscopes(mockPorts);

    expect(transitSpy).toHaveBeenCalledTimes(1);
    expect(textSpy).toHaveBeenCalled();
  });

  it('addNewsToTotal asks the source, not the live news API, for its items', async () => {
    const { addNewsToTotal } = await import('../newsFetching.js');
    const fetchSpy = vi.spyOn(mockPorts.news, 'fetchPage');

    await addNewsToTotal(10, mockPorts.news).catch(() => undefined);

    expect(fetchSpy).toHaveBeenCalled();
    expect(fetchSpy.mock.calls[0][0] ?? '').toBe('');
  });

  it('throws rather than fetching when the source has no calls left', async () => {
    const { addNewsToTotal } = await import('../newsFetching.js');
    const spentSource = {
      contentSource: 'mock' as const,
      remainingCalls: () => 0,
      fetchPage: vi.fn(),
    };

    await expect(addNewsToTotal(10, spentSource)).rejects.toThrow('No more tokens remaining.');
    expect(spentSource.fetchPage).not.toHaveBeenCalled();
  });

  it('selectDailyFeaturedArticle takes its random source as a parameter', async () => {
    const { selectDailyFeaturedArticle } = await import('../featuredArticleSelection.js');
    const randomBelow = vi.fn(() => 0);

    // The query stub throws, so the job lands in its catch block before any
    // selection happens: this asserts the signature, not the choice.
    await expect(selectDailyFeaturedArticle(randomBelow)).resolves.toBeUndefined();
  });

  it('never calls the live text or image services', async () => {
    const textSpy = vi.spyOn(llmService, 'generateTextFromString');
    const imageSpy = vi.spyOn(imageService, 'generateAndSaveImage');

    const { generateDailyHoroscopes } = await import('../horoscopeGeneration.js');
    await generateDailyHoroscopes(mockPorts);

    expect(textSpy).not.toHaveBeenCalled();
    expect(imageSpy).not.toHaveBeenCalled();
  });
});
