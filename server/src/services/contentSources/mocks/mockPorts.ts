/**
 * The mock implementations of the four ports.
 *
 * These read the same canned data the dev seeder reads
 * (`contentSources/mocks/mockContent.ts`), so there is still exactly one place
 * where invented content is written down — the mocks are adapters over that data,
 * not a second copy of it.
 *
 * Every one of them is **deterministic**: same input, same output, every run. That
 * is what makes a job testable — a test can assert the exact rows a job wrote
 * instead of asserting "something happened". It is also why `MockTextGenerator`
 * derives its text from a hash of the prompt rather than from a random source.
 *
 * Nothing here touches the network, the filesystem or an API key.
 */
import type { NewsItem } from '../../newsService.js';
import type { AstrologicalData } from '../../astrologyService.js';
import type { GenerateContentResponse } from '../../../types/llm.js';
import type {
  ImageGenerator,
  NewsSource,
  TextGenerator,
  TransitSource,
} from '../../../types/contentPorts.js';
import { MOCK_CONTENT_SOURCE } from '../../../types/contentSource.js';
import { MOCK_NEWS_ITEMS, buildMockAstrologicalData, createSeededRandom } from './mockContent.js';

/**
 * The page token after the last page.
 *
 * Matches the live source's convention: `fetchPage()` returns `''` when there is
 * nothing left, and `newsFetching` treats that as the end of the run.
 */
const END_OF_PAGES = '';

/** Number of items a mock news page serves — mirrors one newsdata.io call. */
const MOCK_NEWS_PAGE_SIZE = 10;

/**
 * Calls a mock source will serve before it reports exhaustion.
 *
 * High but finite: a job that loops forever against a mock would hang a test,
 * and an infinite budget would hide a runaway loop that the live source would
 * have stopped with a token error.
 */
const MOCK_CALL_BUDGET = 1000;

/** A fixed, plausible image filename stem — no bytes are written by the mock. */
const MOCK_IMAGE_PREFIX = 'dev-mock-image';

/**
 * Turns a string into a stable 32-bit seed (FNV-1a).
 *
 * Used so the same prompt always yields the same "generated" text. A `Math.random`
 * here would make every job run produce different rows for identical input, which
 * would defeat the point of running the pipeline in a test at all.
 */
function hashSeed(value: string): number {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

/**
 * Pages through the canned news items.
 *
 * Page N serves the N-th slice of `MOCK_NEWS_ITEMS`, so asking twice advances
 * through the same list a real source would page through — a job that loops until
 * the source dries up therefore terminates here too.
 */
export class MockNewsSource implements NewsSource {
  readonly contentSource = MOCK_CONTENT_SOURCE;

  private callsServed = 0;

  /** Serves the slice of canned items named by the page token. */
  async fetchPage(page: string = ''): Promise<{ items: NewsItem[]; nextPage: string }> {
    const pageIndex = Number.parseInt(page, 10);
    const start = Number.isNaN(pageIndex) ? 0 : pageIndex * MOCK_NEWS_PAGE_SIZE;
    const slice = MOCK_NEWS_ITEMS.slice(start, start + MOCK_NEWS_PAGE_SIZE);

    this.callsServed++;
    // A short page means the list ran out during this call, so there is no next
    // page. Comparing `start + PAGE_SIZE` against the length would instead
    // promise a page after a partial one, and the caller would keep asking.
    const hasMore = slice.length === MOCK_NEWS_PAGE_SIZE;
    const nextPage = hasMore ? String(start / MOCK_NEWS_PAGE_SIZE + 1) : END_OF_PAGES;

    return { items: slice.map(toNewsItem), nextPage };
  }

  /** The remaining share of the fixed budget. */
  remainingCalls(): number {
    return Math.max(0, MOCK_CALL_BUDGET - this.callsServed);
  }
}

/** Shapes one canned news record into the row type the database stores. */
function toNewsItem(record: (typeof MOCK_NEWS_ITEMS)[number]): NewsItem {
  const publishedAt = new Date(Date.now() - record.hoursAgo * 60 * 60 * 1000);

  return {
    article_id: record.articleId,
    title: record.title,
    description: record.description,
    pubDate: publishedAt.toISOString(),
    pubDateTZ: 'UTC',
    contentSource: MOCK_CONTENT_SOURCE,
  };
}

/**
 * Produces deterministic placeholder prose from the prompt.
 *
 * The text is fake and says so, rather than pretending to be an article: content
 * that reads real is content someone might ship by accident, and the marker only
 * helps if a human notices something is off before that happens.
 */
export class MockTextGenerator implements TextGenerator {
  readonly contentSource = MOCK_CONTENT_SOURCE;

  /** Returns text (or a JSON object) derived from `prompt`. */
  async generate(
    prompt: string,
    type: string = 'text',
    _temperature: number = 0.8,
  ): Promise<GenerateContentResponse | undefined> {
    const random = createSeededRandom(hashSeed(prompt));
    const marker = Math.floor(random() * 90000) + 10000;

    if (type === 'json_object') {
      return {
        success: true,
        generatedText: JSON.stringify({
          title: `Mock Content ${marker}`,
          shortDescription: `Deterministic placeholder text (${MOCK_CONTENT_SOURCE}).`,
          paragraphPrompts: ['A placeholder paragraph.', 'Another placeholder paragraph.'],
          imagePrompt: `placeholder illustration ${marker}`,
        }),
        error: '',
      };
    }

    return {
      success: true,
      generatedText:
        `This is deterministic placeholder text (${MOCK_CONTENT_SOURCE}, run ${marker}). ` +
        `It exists so the pipeline can be exercised without an API key.`,
      error: '',
    };
  }
}

/**
 * Returns a fixed filename without writing an image.
 *
 * No bytes are written on purpose: the mock is for exercising the *pipeline*, and
 * a generated file that no image ever occupies would leave the images directory
 * full of files that look real until opened.
 */
export class MockImageGenerator implements ImageGenerator {
  readonly contentSource = MOCK_CONTENT_SOURCE;

  private imagesProduced = 0;

  /** @returns A stable filename per prompt, unique within this process. */
  async generateAndSave(positivePrompt: string): Promise<string> {
    this.imagesProduced++;
    const suffix = hashSeed(positivePrompt) % 100000;

    return `${MOCK_IMAGE_PREFIX}-${suffix}-${this.imagesProduced}.webp`;
  }
}

/** Planetary positions derived from the date, not fetched. */
export class MockTransitSource implements TransitSource {
  readonly contentSource = MOCK_CONTENT_SOURCE;

  /** Delegates to `buildMockAstrologicalData()`, so the same day gives the same sky. */
  async fetchTransits(date?: Date): Promise<AstrologicalData> {
    const targetDate = date ?? new Date();
    const dateIso = targetDate.toISOString().split('T')[0];

    return buildMockAstrologicalData(dateIso);
  }
}
