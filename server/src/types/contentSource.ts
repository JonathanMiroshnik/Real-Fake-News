/**
 * Where a persisted row came from (roadmap entry 6 of `plans/README.md`).
 *
 * Stored in the `contentSource` column of the content tables, and the only honest
 * answer to "is this row fake?": the `dev-` key prefix is a naming convention the
 * seeder is free to break, this is a column the database enforces.
 *
 * Nothing here belongs to a single content type — articles, news items, writers,
 * recipes and horoscopes all carry the same marker — so this module holds no
 * domain types and must keep importing none. That is what lets every other type
 * file depend on it without pulling in a table's own shape.
 *
 * - 'live': written by the real pipeline, from real provider data.
 * - 'mock': written by the seeder or by a mock content-source adapter.
 */
export type ContentSource = 'live' | 'mock';

/**
 * The value every live write path stores.
 *
 * Note it is not usually the column default that applies: `insert` binds it
 * explicitly, because better-sqlite3 refuses to bind `undefined` and the insert
 * statements name the column. The `DEFAULT 'live'` only catches rows written
 * outside `insert`.
 */
export const LIVE_CONTENT_SOURCE: ContentSource = 'live';

/** The value the seeder and the mock content-source adapters stamp explicitly. */
export const MOCK_CONTENT_SOURCE: ContentSource = 'mock';
