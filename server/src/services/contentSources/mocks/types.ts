/**
 * Shapes of the canned content in `contentSources/mocks/`.
 *
 * Deliberately plain data (no DB row types): the same arrays feed the dev seeder
 * today and the mock content-source adapters in Phase 3, so they must not know
 * anything about `sqliteOperations` (`plans/dev-content-seeding.md`).
 *
 * Every record carries a stable `key`/`articleId` prefixed with `dev-`, which is
 * what makes seeding idempotent: a second run finds the row already there, and
 * `--reset` can remove exactly what was seeded without touching real content.
 */
import type { ZodiacSign } from '../../../types/horoscope.js';

/** Who "wrote" a seeded article — mirrors `ArticleScheme['writerType']`. */
export type MockWriterType = 'AI' | 'Human' | 'Synthesis';

/** A seeded writer profile. `authorKey` on articles references `MockWriter.key`. */
export interface MockWriter {
  key: string;
  name: string;
  description: string;
  systemPrompt: string;
}

/** A seeded blog post. `hoursAgo` places it inside the last week. */
export interface MockArticle {
  key: string;
  title: string;
  shortDescription: string;
  category: string;
  authorKey: string;
  writerType: MockWriterType;
  hoursAgo: number;
  paragraphs: string[];
}

/** A seeded news item — the raw material the writing jobs would normally fetch. */
export interface MockNewsItem {
  articleId: string;
  title: string;
  description: string;
  hoursAgo: number;
}

/** A seeded recipe. */
export interface MockRecipe {
  key: string;
  title: string;
  shortDescription: string;
  authorKey: string;
  writerType: MockWriterType;
  hoursAgo: number;
  paragraphs: string[];
}

/** One zodiac sign's text for today's seeded horoscope set. */
export interface MockHoroscopeEntry {
  zodiacSign: ZodiacSign;
  content: string;
}
