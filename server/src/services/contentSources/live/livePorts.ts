/**
 * The live implementations of the four ports.
 *
 * Each one is deliberately thin: it calls the existing service function and
 * nothing else. The point of this layer is not to add behaviour but to give the
 * pipeline something to depend on that is not a module-scope `import` of a
 * network client. Any logic here would be logic that runs in production but not
 * in tests, which is exactly the asymmetry Phase B is trying to remove.
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
import { LIVE_CONTENT_SOURCE } from '../../../types/contentSource.js';
import { fetchNews } from '../../newsService.js';
import { NEWS_API_DAILY_TOKENS } from '../../../config/constants.js';
import { generateTextFromString } from '../../llmService.js';
import { generateAndSaveImage } from '../../imageService.js';
import { fetchAstrologicalData } from '../../astrologyService.js';

/**
 * News items from the newsdata.io API, metered by the daily token budget.
 *
 * The budget lives here rather than in `newsService` because it is a property of
 * this provider, not of news in general: the counter, the midnight reset and the
 * decrement are three views of one fact. Keeping them in a module `let` made them
 * shared by every instance and every test in a file, so the order of `it()` blocks
 * could change the outcome — and a `new LiveNewsSource()` in a test inherited
 * whatever a previous test had spent.
 */
export class LiveNewsSource implements NewsSource {
  readonly contentSource = LIVE_CONTENT_SOURCE;

  private tokensLeft: number;

  /**
   * @param tokens Daily call budget; defaults to the configured allowance.
   */
  constructor(tokens: number = NEWS_API_DAILY_TOKENS) {
    this.tokensLeft = tokens;
  }

  /**
   * One page, charged against the budget.
   *
   * Charging here rather than in `fetchNews()` is what makes the count honest: the
   * caller holding the budget is the one that spends it.
   *
   * The charge happens in `finally`, so a `fetchNews()` that throws still costs a
   * call. Without that, a provider outage would burn the network without burning
   * the budget, and the job would retry against a spent allowance that still reads
   * as full. `fetchNews()` swallows its own HTTP errors, so this path is for
   * failures below that — a bad key, a thrown mock, an unwrapped exception.
   *
   * @param page Opaque continuation token; `''` for the first page.
   */
  async fetchPage(page: string = ''): Promise<{ items: NewsItem[]; nextPage: string }> {
    if (this.tokensLeft <= 0) {
      throw new Error('No more tokens remaining to do another API call.');
    }

    try {
      const [items, nextPage] = await fetchNews(page);

      return { items, nextPage };
    } finally {
      this.tokensLeft--;
    }
  }

  /** Tokens left in the current day. */
  remainingCalls(): number {
    return this.tokensLeft;
  }

  /**
   * Refills the daily budget.
   *
   * Public because the reset is a schedule decision: the cron that calls this is
   * registered by the scheduler (6.6), not by a module import side effect.
   */
  resetDailyCalls(): void {
    this.tokensLeft = NEWS_API_DAILY_TOKENS;
  }
}

/** Prose from DeepSeek. */
export class LiveTextGenerator implements TextGenerator {
  readonly contentSource = LIVE_CONTENT_SOURCE;

  /** Delegates to `generateTextFromString()`, keeping its defaults. */
  async generate(
    prompt: string,
    type: string = 'text',
    temperature: number = 0.8,
  ): Promise<GenerateContentResponse | undefined> {
    return generateTextFromString(prompt, type, temperature);
  }
}

/** Images from Runware, saved to the configured images directory. */
export class LiveImageGenerator implements ImageGenerator {
  readonly contentSource = LIVE_CONTENT_SOURCE;

  /** Delegates to `generateAndSaveImage()`, which picks the output format. */
  async generateAndSave(positivePrompt: string): Promise<string> {
    return generateAndSaveImage(positivePrompt);
  }
}

/** Planetary positions from FreeAstroAPI, cached for the current day upstream. */
export class LiveTransitSource implements TransitSource {
  readonly contentSource = LIVE_CONTENT_SOURCE;

  /** Delegates to `fetchAstrologicalData()`; the caching stays where it is. */
  async fetchTransits(date?: Date): Promise<AstrologicalData> {
    return fetchAstrologicalData(date);
  }
}
