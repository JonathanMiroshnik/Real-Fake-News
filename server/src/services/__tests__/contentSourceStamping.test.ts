import { describe, it, expect, vi, beforeAll } from 'vitest';
import type { ContentPorts } from '../../types/contentPorts.js';
import type { Writer } from '../../types/writer.js';

/**
 * Pins the rule that every row the pipeline writes carries the origin of the port
 * that produced it (roadmap entry 6 of `plans/README.md`).
 *
 * The failure this guards against is silent: a row built without `contentSource`
 * is written with the column default `'live'`, so a mock article lands looking
 * exactly like a generated one. Nothing errors, nothing logs, and the only way to
 * notice is to read the database after the fact.
 *
 * `better-sqlite3` is stubbed for the same reason as `mockPipeline.test.ts`: the
 * native binding cannot be built in every environment. The stub answers "no such
 * row" so the services run to completion, and the assertions are about the object
 * handed to the writer, not about storage. The live generators are never reached —
 * a mock port set is injected — which is also why the image port returns a name.
 */
const noRowsStatement = {
  get: () => undefined,
  all: () => [],
  run: () => ({ changes: 0 }),
};

/** A `writers` row already in the database, marked `live` by the seeder's default. */
const STORED_WRITER_ROW = {
  key: 'seed-writer-1',
  name: 'Seed Writer',
  description: 'A writer seeded long ago',
  systemPrompt: 'Write like a seed.',
  contentSource: 'live',
};

/**
 * Every `SELECT *` returns the seeded writer.
 *
 * `findAll` maps rows per table from the same shape, so returning one writer for
 * all queries is what lets `getRandomWriter()` run; the other services ask for the
 * first row of their own table (`stmt.get()`) and get `undefined`, which they
 * handle as "nothing there yet".
 */
vi.mock('better-sqlite3', () => ({
  default: class DatabaseStub {
    pragma(): void {}
    prepare(): {
      get: () => undefined;
      all: () => (typeof STORED_WRITER_ROW)[];
      run: () => object;
    } {
      return {
        get: () => undefined,
        all: () => [STORED_WRITER_ROW],
        run: () => ({ changes: 0 }),
      };
    }
    exec(): void {}
    close(): void {}
  },
}));

const PROSE_WITH_IMAGE = {
  success: true,
  generatedText: JSON.stringify({
    title: 'Mock headline',
    content: 'Mock body',
    shortDescription: 'Mock summary',
    category: 'Technology',
    prompt: 'a mock illustration',
    paragraphs: ['One paragraph.'],
    imagePrompts: [],
  }),
  error: '',
};

const SEEDED_WRITER: Writer = {
  key: 'dev-writer-1',
  name: 'Seed Writer',
  description: 'A seeded writer',
  systemPrompt: 'Write like a seed.',
};

describe('rows are stamped with the origin of the port that wrote them', () => {
  let mockPorts: ContentPorts;

  beforeAll(async () => {
    const { MockImageGenerator, MockNewsSource, MockTextGenerator, MockTransitSource } =
      await import('../contentSources/mocks/mockPorts.js');

    mockPorts = {
      news: new MockNewsSource(),
      text: new MockTextGenerator(),
      image: new MockImageGenerator(),
      transit: new MockTransitSource(),
    };
  });

  /** A port set whose text generator returns a fixed JSON body. */
  function withProse(body: unknown): ContentPorts {
    return {
      ...mockPorts,
      text: {
        contentSource: mockPorts.text.contentSource,
        generate: async () => ({ success: true, generatedText: JSON.stringify(body), error: '' }),
      },
    };
  }

  it('stamps an article built by the explanation path', async () => {
    const { generateNewsArticleFromExplanation } = await import('../blogService.js');
    const ports = withProse({
      ...JSON.parse(PROSE_WITH_IMAGE.generatedText),
    });

    const article = await generateNewsArticleFromExplanation(
      SEEDED_WRITER,
      ['point one'],
      undefined,
      false,
      ports,
    );

    expect(article?.contentSource).toBe('mock');
  });

  it('stamps an article written through writeBlogPost', async () => {
    const { writeBlogPost } = await import('../blogService.js');
    const ports = withProse(JSON.parse(PROSE_WITH_IMAGE.generatedText));

    // `generateNewsExplanation` parses plain text, so the same JSON body yields
    // one explanation line — enough for the article path to run.
    const article = await writeBlogPost(SEEDED_WRITER, undefined, false, ports);

    expect(article?.contentSource).toBe('mock');
  });

  it('stamps a recipe built from the text port', async () => {
    const { generateRecipe } = await import('../recipeService.js');
    const ports = withProse({
      title: 'Mock stew',
      paragraphs: ['Stir.'],
      shortDescription: 'A mock stew',
      headImagePrompt: 'a pot',
      imagePrompts: [],
    });

    const recipe = await generateRecipe(SEEDED_WRITER, ['salt'], false, ports);

    expect(recipe?.contentSource).toBe('mock');
  });

  it('re-stamps a writer read from the database with the caller origin', async () => {
    const { getRandomWriter } = await import('../writerService.js');

    // The stored row says 'live'; the pipeline this run belongs to says 'mock'.
    const writer = await getRandomWriter(() => 0, mockPorts);

    expect(writer.contentSource).toBe('mock');
    expect(writer.key).toBe(STORED_WRITER_ROW.key);
  });
});
