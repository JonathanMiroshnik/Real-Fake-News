# Dev Content Marking: Proving Which Rows Are Fake

> **Status:** Planned · **Priority:** High · **Related:** `plans/dev-content-seeding.md` (Phases 1, 3), `plans/featured-articles.md` · **Order:** prerequisite to entry 6 of the 2026-11-07 session (`plans/README.md`)

## Problem

Entry 6 gives dev a real write path by swapping the content-source ports to `mock`. That
creates a new question the current design cannot answer: **once the pipeline writes fake rows
instead of a controller serving them at read time, how does any row prove where it came from?**

Today the only marker is a string prefix inside the primary key — `dev-article-01`
(`mockArticles.ts`), `SEEDED_KEY_PREFIX = 'dev-'` (`mockContent.ts:30`). That is a naming
convention, not a mechanism:

- **Not enforced on write.** `insertSeedRow()` (`server/src/scripts/seed/seedRows.ts:20-44`)
  hands `row` straight to `createPost(row, dbConfig)`. Nothing asserts the key starts with
  `dev-`, so a mock record authored with an ordinary key writes an ordinary-looking row.
- **Not its own column.** The marker is the primary key, so there is no
  `WHERE isDev = 1`. The honest query behind `--reset` does not exist; instead
  `resetSeededBlogContent()` iterates `MOCK_ARTICLES` / `MOCK_WRITERS` / `MOCK_NEWS_ITEMS` and
  deletes by key. Remove a record from the mock file and its row becomes undeletable.
- **Invisible through the API.** `ArticleScheme` carries `writerType`, `isFeatured`,
  `featuredDate` — nothing about origin, so no client, admin screen or health check can report
  that a response contains invented content.
- **Invisible to the pipeline.** Once Phase 3 writes through the same `createPost` as
  production, a mock-generated row is byte-for-byte indistinguishable from a real one. Only the
  seeder's rows are marked at all; mock _adapters_ mark nothing.

### What the guards actually cover (checked 9 November 2026)

The `NODE_ENV` guards are better than the plan text suggests, and they still leave one hole:

- `docker-compose.yml:37` sets `NODE_ENV: production`; `docker-compose.override.yml` sets
  `development` for `server` and `seed`. The override is loaded automatically _because of its
  filename_, and production must opt out with `-f docker-compose.yml`.
- `assertNotProduction()` (`seedOptions.ts:83-100`) therefore does fire for the `seed` service,
  and `ENABLE_FAKE_DATA` already defaults to `false` in both compose files.
- **The hole:** production suppressing the overlay is a _command-line convention_
  (`docker compose -f docker-compose.yml up -d`). That same command with
  `-f docker-compose.override.yml` accepts `--force`, and `--force` downgrades the prod refusal
  to a `console.warn`. A typo in that one invocation seeds the production volume.

So the residual risk is not "the seeder has no guard". It is that a seeded or mock row, once
written, **cannot be detected afterwards** — nothing distinguishes it, so no startup check, no
alert and no cleanup can act on it.

### Two kinds of "mixing" — only one is a bug

| Case                                                                     | Verdict                                                                                                                      |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Production serves invented rows (seeded, or the read-time fallback)      | The bug. Must be impossible, and loud                                                                                        |
| A developer's own DB holds both seeded rows and genuinely generated ones | Normal and intended — this is what entry 6 buys. The requirement is not separation, it is that each row stays _attributable_ |

The distinction is the whole design: fake data may coexist with real data, but must never be
able to hide among it.

## Goal

1. Every row carries its origin in a queryable column, regardless of which path wrote it.
2. Production refuses to start with mock content present, or with `CONTENT_SOURCE=mock`.
3. `--reset` becomes one honest delete, not a loop over a hand-maintained key list.
4. A developer can always answer "is this row fake?" without knowing the mock-content file.

## Architecture

One enum, stamped by the code closest to the data and read by everything above it:

```ts
// server/src/services/contentSources/types.ts (introduced by entry 6)
export type ContentSource = 'live' | 'mock';
```

- `contentSource` column, `TEXT NOT NULL DEFAULT 'live'`, on `blog_posts`, `recipes`,
  `horoscopes`, `news_items`, `writers`.
- `live` ports stamp `'live'` (the column default, so live code paths need no change at all).
- `mock` ports and the seeder stamp `'mock'` explicitly.
- Readers ignore the column for ranking and selection; it is metadata, not a filter, in dev.
  Production treats any non-`live` row as a fault (below).

Why a column rather than the key prefix: it survives a hand-edited key, it is `COUNT(*)`-able
in production as a real metric instead of a `LIKE 'dev-%'` guess, it is filterable in the admin
panel, and it makes `--reset` a single statement that cannot leak rows.

## Implementation

### Phase A — store the marker (do first; entry 6 depends on it)

- [ ] Add `contentSource TEXT NOT NULL DEFAULT 'live'` to the five tables in `schema.ts`, using
      the existing `ALTER TABLE` + `duplicate column name` swallow pattern already used for
      `writerType` (`schema.ts:30-57`) and `isFeatured` (`schema.ts:61-91`). Backfill is
      implicit: the default applies to existing rows.
- [ ] Extend `ArticleScheme` / `RecipeScheme` / horoscope / `NewsItem` / `Writer` types with
      `contentSource: ContentSource`.
- [ ] Add `isSeededContentKey()` next to `SEEDED_KEY_PREFIX` in `mockContent.ts` and call it from
      `insertSeedRow()` — **throw** if a seeder row's key is not `dev-…` and its
      `contentSource` is not `'mock'`. The prefix becomes a redundant guard rail, not the
      mechanism.
- [ ] Rewrite `resetSeededBlogContent()` / `resetSeededKitchenContent()` to
      `DELETE ... WHERE contentSource = 'mock'` (plus deleting images referenced by the removed
      rows), so `--reset` no longer depends on `MOCK_ARTICLES` matching the database.
- [ ] Tests: schema migration is idempotent on an existing DB; existing rows come back as
      `'live'`; a `dev-…` row with `contentSource: 'live'` is rejected by the seeder.

### Phase B — stamp from the pipeline (part of entry 6)

- [ ] Mock adapters write rows with `contentSource: 'mock'`; live adapters with `'live'`.
- [ ] Integration test per job (entry 6's own criterion) additionally asserts the
      `contentSource` of every inserted row, so "the port was injected" is proven by data and
      not only by a `vi.mock` on `axios`.

### Phase C — fail closed

- [ ] Boot check in the server: if `NODE_ENV === 'production'` and `CONTENT_SOURCE === 'mock'` →
      throw (same shape as `config/paths.ts`'s `MissingPathConfigError`, which already refuses to
      start rather than degrade).
- [ ] Boot check in the server: in production, `SELECT COUNT(*) WHERE contentSource = 'mock'` on
      each table; non-zero → throw, naming the count and the `DATABASE_PATH` in use. This is the
      check that would have caught a mis-invoked compose command, and it is the only one that
      looks at the _data_ rather than at _intent_.
- [ ] `assertNotProduction()` keeps its throw, and `--force` in production additionally requires
      an explicit confirmation string (`--i-know-this-is-a-demo`) instead of a single flag.
      Rationale: a flag is something you type by habit; a phrase is a decision.
- [ ] Expose the count in the health endpoint (or the startup log) in every environment, so dev
      sees "mock rows: 67" instead of wondering why the feed looks odd.

### Do not do

- **No visible "FAKE" badge in production UI.** By the time a badge is needed in production,
  fake content has already got in; labelling it only makes a failure presentable. A badge is
  acceptable only in a deliberate demo deployment, and only when `CONTENT_SOURCE !== 'live'`.
- **No production read path that silently filters `contentSource = 'mock'`.** Filtering turns a
  loud failure into an empty page, which is harder to notice — the exact mistake
  `ENABLE_FAKE_DATA` made in the other direction.

## DevOps Impact

- No new required variables. `CONTENT_SOURCE` stays optional and defaults to `live`.
- Two new startup refusals in production; both must be documented in `docs/configuration.md`
  next to the required `DATABASE_PATH` / `IMAGES_PATH` entries.
- One schema migration per table, taken by the existing `initializeSchema()` on boot. SQLite
  `ADD COLUMN` with a non-null default is cheap; no downtime step needed.
- A demo deployment that intentionally wants mock content must set `CONTENT_SOURCE=mock` _and_
  pass the typed confirmation at seed time, so the intent is recorded in two places.
- The production command (`docker compose -f docker-compose.yml up -d`) does not change. That is
  deliberate: this plan removes reliance on remembering it.

## Testing

- Migration: run `initializeSchema()` twice on a populated DB → no error, no data change.
- Seeder: a mock record with a non-`dev-` key exits non-zero with a message naming the record.
- `--reset`: seeded rows and their images are removed; live rows (inserted by hand in the test)
  are untouched; row counts match the pre-seed state.
- Boot: `NODE_ENV=production` + one `mock` row → process exits non-zero; the same DB under
  `NODE_ENV=development` → starts, and reports the mock count.
- Guard regression: the compose invocation matrix — with and without the overlay, with and
  without `-f docker-compose.yml` — documented in `docs/configuration.md` and smoke tested once
  by hand.

## Security

- The marker is not a trust boundary; it is an integrity check. Anything that can write to the
  DB can write `contentSource: 'live'`, so production safety still rests on the _startup_
  refusal and on `--force` being inconvenient, not on the column being unforgeable.
- `contentSource` in API responses leaks nothing about the deployment, but the _count_ of mock
  rows should stay out of any public endpoint — it advertises an unpopulated environment.

## Edge Cases

- **Rows predating the migration** become `'live'`, which is wrong for anything seeded before
  this lands. Acceptable: those DBs are dev-only, and re-running `--reset` + `seed:dev` is the
  documented fix. Say so in the migration commit message.
- **`--force` re-seed** must delete by key _and_ rewrite `contentSource: 'mock'`; otherwise a
  force-updated row keeps whatever the previous version wrote.
- **Featured article.** `featuredArticleSelection.ts` picks from `getAllPostsAfterDate()` over
  all rows, so in a dev DB it can pin a seeded row as the hero. Fine in dev, but it matters to
  `plans/featured-articles.md`, which should not assume every candidate is real.
- **Mock drift** is already covered: `mockContent.ts` is typed, so a new column is a compile
  error (`plans/dev-content-seeding.md`, Edge Cases).
- **ADR / decision record.** If this plan is rejected, record _why_ — the tempting shortcut is
  "the compose override already keeps dev and prod apart", and that reasoning is only valid
  while the `-f` convention holds.

## Alternatives Considered

- **Key prefix only (today's design).** Zero schema change, and it already makes the seeder
  idempotent. Rejected because it is unenforceable on write, invisible through the API, and
  cannot express "all mock rows" for cleanup or for a production integrity check.
- **Separate database file per content source.** Total isolation, and attractive for a pure dev
  environment — but it defeats entry 6's purpose (one database, one pipeline) and makes the
  tested path differ from the shipped one in exactly the way `ENABLE_FAKE_DATA` did.
- **A sidecar table (`mock_content_keys`).** No migration on five tables, but it is a second
  source of truth that can drift from the rows it describes, and every "is this fake?" read
  becomes a join.
- **Trust `NODE_ENV` and skip marking entirely.** Cheapest, and it is where the project stands
  today. It only answers "was this process asked to produce fake data?", never "does this
  database contain fake data?" — and the second question is the one that matters after a
  mis-invoked `docker compose` command.
- **Delete the seeder once entry 6 lands.** Tempting (entry 6 makes it "mostly unnecessary
  ceremony"), but kept deliberately: the seeder is the known-state reset, and this plan makes it
  the one component that writes a marker it can also verify.
