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
import { fetchNews, remainingTokens } from '../../newsService.js';
import { generateTextFromString } from '../../llmService.js';
import { generateAndSaveImage } from '../../imageService.js';
import { fetchAstrologicalData } from '../../astrologyService.js';

/** News items from the newsdata.io API, metered by the daily token budget. */
export class LiveNewsSource implements NewsSource {
  readonly contentSource = LIVE_CONTENT_SOURCE;

  /** Delegates to `fetchNews()`; the page token is the provider's. */
  async fetchPage(page: string = ''): Promise<{ items: NewsItem[]; nextPage: string }> {
    const [items, nextPage] = await fetchNews(page);

    return { items, nextPage };
  }

  /**
   * Reads `remainingTokens` on every call rather than capturing it.
   *
   * The counter is a module-level `let` reset by a midnight cron, so a snapshot
   * taken at construction would go stale and the jobs would either refuse to run
   * or overrun the budget.
   */
  remainingCalls(): number {
    return remainingTokens;
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
