import { describe, it, expect, vi, beforeAll } from 'vitest';

/**
 * Pins 6.2 of `plans/dev-content-marking.md`: a row for a table that has the
 * `contentSource` column must carry a marker, and a missing one is an error
 * rather than the column default.
 *
 * The column default is what made the original bug invisible — a row with no
 * marker was written as `'live'`, so a mock article was not missing a value, it
 * was asserting a false one. These tests therefore assert on the *bound
 * parameter* reaching SQLite, not on any application-level object.
 *
 * `better-sqlite3` is stubbed: the native binding cannot be built everywhere, and
 * the question here is what `insert()` binds, which the stub can answer exactly
 * by recording each `run()` call.
 */
const boundParameters: unknown[][] = [];

vi.mock('better-sqlite3', () => ({
  default: class DatabaseStub {
    pragma(): void {}
    prepare(): {
      get: () => undefined;
      run: (...args: unknown[]) => object;
    } {
      return {
        // `exists()` runs before the marker check; every row is "not there yet".
        get: () => undefined,
        run: (...args: unknown[]) => {
          boundParameters.push(args);
          return { changes: 1 };
        },
      };
    }
    exec(): void {}
    close(): void {}
  },
}));

describe('insert() requires a content source marker on marked tables', () => {
  let insert: typeof import('../sqliteOperations.js').insert;
  let MissingContentSourceError: typeof import('../sqliteOperations.js').MissingContentSourceError;
  let blogDatabaseConfig: typeof import('../databaseConfigurations.js').blogDatabaseConfig;
  let writerDatabaseConfig: typeof import('../databaseConfigurations.js').writerDatabaseConfig;
  let featuredBlogDatabaseConfig: typeof import('../databaseConfigurations.js').featuredBlogDatabaseConfig;

  beforeAll(async () => {
    ({ insert, MissingContentSourceError } = await import('../sqliteOperations.js'));
    ({ blogDatabaseConfig, writerDatabaseConfig, featuredBlogDatabaseConfig } = await import(
      '../databaseConfigurations.js'
    ));
  });

  const articleRow = { title: 'A headline', content: 'Body text' };

  it('refuses a blog post with no marker instead of defaulting it to live', async () => {
    boundParameters.length = 0;

    await expect(
      insert(blogDatabaseConfig, { ...articleRow, key: 'no-marker' } as never),
    ).rejects.toThrow(MissingContentSourceError);

    expect(boundParameters).toHaveLength(0);
  });

  it('refuses a writer with no marker', async () => {
    await expect(
      insert(writerDatabaseConfig, { key: 'writer-no-marker', name: 'W' } as never),
    ).rejects.toThrow(MissingContentSourceError);
  });

  it('names the table in the error, so the call site is findable', async () => {
    await expect(
      insert(blogDatabaseConfig, { ...articleRow, key: 'names-table' } as never),
    ).rejects.toThrow(/blog_posts/);
  });

  it('binds an explicit mock marker unchanged', async () => {
    boundParameters.length = 0;

    await insert(blogDatabaseConfig, {
      ...articleRow,
      key: 'mock-row',
      contentSource: 'mock',
    } as never);

    expect(boundParameters.at(-1)?.at(-1)).toBe('mock');
  });

  it('binds an explicit live marker unchanged', async () => {
    boundParameters.length = 0;

    await insert(blogDatabaseConfig, {
      ...articleRow,
      key: 'live-row',
      contentSource: 'live',
    } as never);

    expect(boundParameters.at(-1)?.at(-1)).toBe('live');
  });

  it('leaves a table without the column alone', async () => {
    boundParameters.length = 0;

    // featured_blog_posts has no contentSource column, so it binds nine values
    // and none of them is a marker: the check must not fire on it.
    await insert(featuredBlogDatabaseConfig, { key: 'featured-row', title: 'T' } as never);

    expect(boundParameters).toHaveLength(1);
    expect(boundParameters[0]).not.toContain('mock');
  });
});

/**
 * Pins the last bullet of Phase C (`plans/dev-content-marking.md`): production
 * refuses a mock row at the one choke point every writer passes through.
 *
 * This is the check that holds for code nobody reviewed. `assertNotProduction()`
 * guards the seeder, but a mock content-source adapter never calls the seeder — it
 * writes through `insert()` directly, so before this the only thing between
 * invented content and a production database was a flag on a different entry
 * point.
 */
describe('insert() refuses mock rows in production', () => {
  let insert: typeof import('../sqliteOperations.js').insert;
  let MockContentInProductionError: typeof import('../sqliteOperations.js').MockContentInProductionError;
  let blogDatabaseConfig: typeof import('../databaseConfigurations.js').blogDatabaseConfig;

  const originalNodeEnv = process.env.NODE_ENV;

  beforeAll(async () => {
    ({ insert, MockContentInProductionError } = await import('../sqliteOperations.js'));
    ({ blogDatabaseConfig } = await import('../databaseConfigurations.js'));
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  const mockArticle = (key: string) => ({
    key,
    title: 'Invented headline',
    content: 'Invented body',
    contentSource: 'mock',
  });

  it('throws instead of writing, and writes nothing', async () => {
    process.env.NODE_ENV = 'production';
    boundParameters.length = 0;

    await expect(insert(blogDatabaseConfig, mockArticle('prod-mock') as never)).rejects.toThrow(
      MockContentInProductionError,
    );

    // The refusal must precede the write, not follow it.
    expect(boundParameters).toHaveLength(0);
  });

  it('is rethrown rather than reported as a duplicate', async () => {
    process.env.NODE_ENV = 'production';

    // `insert()` returns false for an existing row; a refused write must not look
    // the same, or a job would treat it as "already there" and carry on.
    const result = insert(blogDatabaseConfig, mockArticle('prod-mock-2') as never);

    await expect(result).rejects.toBeInstanceOf(MockContentInProductionError);
  });

  it('allows a live row in production', async () => {
    process.env.NODE_ENV = 'production';
    boundParameters.length = 0;

    await insert(blogDatabaseConfig, {
      key: 'prod-live',
      title: 'Real headline',
      content: 'Real body',
      contentSource: 'live',
    } as never);

    expect(boundParameters).toHaveLength(1);
  });

  it('allows a mock row outside production, which is what the marker is for', async () => {
    process.env.NODE_ENV = 'development';
    boundParameters.length = 0;

    await insert(blogDatabaseConfig, mockArticle('dev-mock') as never);

    expect(boundParameters.at(-1)?.at(-1)).toBe('mock');
  });
});
