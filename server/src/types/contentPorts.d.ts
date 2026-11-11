/**
 * The four things the content pipeline cannot do without a third-party service.
 *
 * Everything else in the pipeline is deterministic (prompt assembly, DB writes,
 * row shaping). These four are the seams where a network call, an API key or a
 * bill sits, so they are the only things that need to be swappable for the jobs
 * to run in a sandbox (roadmap entry 6 of `plans/README.md`).
 *
 * A port describes *capability*, not a provider: `NewsSource` says "give me news
 * items", not "call newsdata.io". That is what lets a mock implementation satisfy
 * the same type as the live one, and it is why an implementation must not expose
 * anything the other one could not provide.
 *
 * Implementations live in `services/contentSources/live/` and
 * `services/contentSources/mocks/`; the selection between them is
 * `services/contentSources/index.ts`.
 */
import type { NewsItem } from '../services/newsService.js';
import type { AstrologicalData } from '../services/astrologyService.js';
import type { GenerateContentResponse } from './llm.js';

/**
 * Fetches raw news items — the material the writing jobs would otherwise invent
 * a topic for.
 *
 * Mirrors `fetchNews()`: the page token is opaque to callers, and an empty
 * `nextPage` means there is nothing more to read. Implementations must return
 * `[]`/`''` rather than throw when they have nothing, because a job that cannot
 * get news is a job that does nothing this cycle, not a crash.
 */
export interface NewsSource {
  /**
   * One page of news items.
   *
   * @param page Opaque continuation token from a previous call; `''` for the first page.
   * @returns The items on this page and the token for the next one.
   */
  fetchPage(page?: string): Promise<{ items: NewsItem[]; nextPage: string }>;

  /**
   * How many more calls this source will serve before it refuses.
   *
   * Exists because the live API is metered and the jobs check the budget before
   * asking. A mock usually reports a large number; the point of the port is that
   * the budget is a property of the source, not of the provider's pricing page.
   */
  remainingCalls(): number;

  /** The origin every item from this source carries into the database. */
  readonly contentSource: 'live' | 'mock';
}

/**
 * Generates prose from a prompt.
 *
 * Mirrors `generateTextFromString()`. `type` is passed through rather than
 * narrowed to a union because the live provider accepts provider-specific values
 * ('text', 'json_object') and the port must not be stricter than what callers
 * already send.
 */
export interface TextGenerator {
  /**
   * @param prompt The full prompt, system and user instructions combined.
   * @param type Response format — `'text'` or `'json_object'`.
   * @param temperature Sampling temperature; the live default is 0.8.
   * @returns The provider's response wrapper, or `undefined` if nothing came back.
   */
  generate(
    prompt: string,
    type?: string,
    temperature?: number,
  ): Promise<GenerateContentResponse | undefined>;

  /** The origin every row built from this generator's output carries. */
  readonly contentSource: 'live' | 'mock';
}

/**
 * Produces an image and saves it, returning the filename to store on the row.
 *
 * Mirrors `generateAndSaveImage()`. Returned as a filename rather than a data URI
 * or a buffer because that is what the schema stores and what the API serves; a
 * port returning bytes would force every caller to know where images live.
 */
export interface ImageGenerator {
  /**
   * @param positivePrompt Description of the image to generate.
   * @returns The saved image's filename.
   */
  generateAndSave(positivePrompt: string): Promise<string>;

  /** The origin every row build from this generator's output carries. */
  readonly contentSource: 'live' | 'mock';
}

/**
 * Provides planetary positions and retrogrades for a date.
 *
 * Mirrors `fetchAstrologicalData()`. This is the one port whose live
 * implementation caches, because the upstream data changes once a day; the mock
 * is deterministic per date, so a test can call it twice and compare.
 */
export interface TransitSource {
  /**
   * @param date The day to describe; defaults to today.
   * @returns Planetary positions, retrogrades and notable aspects for that day.
   */
  fetchTransits(date?: Date): Promise<AstrologicalData>;

  /** The origin every horoscope row built from this source carries. */
  readonly contentSource: 'live' | 'mock';
}

/** The full set of ports the pipeline depends on, resolved once at startup. */
export interface ContentPorts {
  news: NewsSource;
  text: TextGenerator;
  image: ImageGenerator;
  transit: TransitSource;
}
