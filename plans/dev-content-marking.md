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
  hands `row` straight to `insert(dbConfig, row)`. Nothing asserts the key starts with
  `dev-`, so a mock record authored with an ordinary key writes an ordinary-looking row.
- **Not its own column.** The marker is the primary key, so there is no
  `WHERE isDev = 1`. The honest query behind `--reset` does not exist; instead
  `resetSeededBlogContent()` iterates `MOCK_ARTICLES` / `MOCK_WRITERS` / `MOCK_NEWS_ITEMS` and
  deletes by key. Remove a record from the mock file and its row becomes undeletable.
- **Invisible through the API.** `ArticleScheme` carries `writerType`, `isFeatured`,
  `featuredDate` — nothing about origin, so no client, admin screen or health check can report
  that a response contains invented content.
- **Invisible to the pipeline.** Once Phase 3 writes through the same `insert` as
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

### Phase A — store the marker (do first; entry 6 depends on it) — **done 9 November 2026** (`8f8c5ecb`)

Landed as one commit. Corrections found while implementing are marked ⚠️ and replace the
original bullet where they disagree.

- [x] Add `contentSource TEXT NOT NULL DEFAULT 'live'` to the five tables in `schema.ts`, using
      the existing `ALTER TABLE` + `duplicate column name` swallow pattern already used for
      `writerType` (`schema.ts:30-57`) and `isFeatured` (`schema.ts:61-91`). Backfill is
      implicit: the default applies to existing rows.
      ⚠️ The original bullet claimed the pattern already existed for the five tables. It did not:
      only `blog_posts` had any `ALTER` block, so `news_items`, `writers`, `recipes` and
      `horoscopes` needed new ones. Hence the five-`ALTER` loop at the end of
      `initializeSchema()`, driven by one `CONTENT_SOURCE_TABLES` list, plus the column declared
      inline in each `CREATE TABLE` so a fresh database never needs the migration pass.
      ⚠️ `foods` is deliberately **not** marked (a row is just a name fed into a recipe prompt,
      and `--reset` deletes exactly the names it wrote). `featured_blog_posts` is not marked
      either — the table is dead, and `blog_posts.contentSource` already describes the article.
      ⚠️ The indexes were not in the plan. Added `idx_<table>_contentSource` so "how many mock
      rows?" is a real `COUNT(*)` rather than a `LIKE 'dev-%'` guess.
- [x] Extend `ArticleScheme` / `RecipeScheme` / horoscope / `NewsItem` / `Writer` types with
      `contentSource: ContentSource`. Done as **optional** (`contentSource?: ContentSource`) in
      the row types, because every live write path omits it and relies on the column default;
      requiring it would force edits to code that must stay untouched in Phase A.
      `ContentSource`, `LIVE_CONTENT_SOURCE` and `MOCK_CONTENT_SOURCE` live in their own module,
      `types/contentSource.ts`. They were first parked in `types/horoscope.ts` on the theory that
      both `types/` and `services/` already imported from it — but nothing outside the horoscope
      domain did, so every other content type had to import the marker _from the horoscope
      module_. The marker describes a column on five tables and no single content type, so the
      module now contains nothing but the marker, imports nothing, and is what every other type
      file depends on (a domain module that imports it must never be imported back into it).
- [x] ⚠️ **Persistence had to be fixed, and the plan never said so.** The marker is only worth
      anything if it survives a round trip: `insert` did not write the column, so every mock
      row would have landed as `'live'` via the default. Three insert branches were extended
      (`blog_posts`, `news_items`, `writers`, `recipes`) behind one `resolveContentSource()`
      helper, and `findAll` / `findOne` / `findPaginated` now return `contentSource`.
- [x] ⚠️ **An earlier revision of this plan explained the round trip wrongly**, and the error was
      worth recording because it is the kind that reads as reassuring. It claimed `update` was safe
      to leave alone because "it copies onto the row it read, so the marker is preserved". Both
      halves are wrong. `update`'s `UPDATE … SET` names its columns explicitly and simply never
      mentions `contentSource`, so the stored value survives by _omission_, not by copying — and
      `find()` did not return the field at all, so every `find()` result had it `undefined`. A
      consumer reading `article.contentSource` off a read row therefore saw "live" for mock rows.
      The fix: all four `find()` returns that have the column now include it, and all five
      `copyValues()` copy it. `featured_blog_posts` is the one config that has neither — that
      table has no such column — which is why `copyValues` there carries the field with a comment
      rather than pretending to persist it.
- [x] ⚠️ **`update` had no `recipes` branch.** A recipe update looked successful and wrote
      nothing: the branch chain fell through to `return true` after preparing no statement. Added
      the `recipes` branch (with the same defaults as the INSERT path, so a round trip is
      lossless) and replaced the silent fall-through with a `throw`, so a future table added
      without an UPDATE branch fails loudly instead of reporting a write that never happened.
- [x] **Renamed the gateway functions to one vocabulary** (its own change, and it touches ~15 call
      sites, so it is called out here rather than buried). `createPost` / `getPostByKey` /
      `getAllPosts` / `getPostsCount` / `getPostsPaginated` / `updatePost` / `deletePost` said
      "post" about five different tables, and mixed the type name (`ArticleScheme`), the table name
      (`blog_posts`), and the column name in a single signature. They are now `insert` / `findOne` /
      `findAll` / `count` / `countByContentSource` / `findPaginated` / `update` / `remove`, with
      `dbConfig` as the **first** argument in every case, because the table descriptor is what
      identifies the call — `insert(blogDatabaseConfig, article)` reads in the order it executes.
      The row type `Post` became `Row` for the same reason: it is a row of an unspecified table.
      `getAllPostsAfterDate` in `blogService` is **not** renamed — it is a service function that
      filters by date, not a gateway call.

- [x] Stamp seeded rows. Replaces the original `isSeededContentKey()` bullet, which proposed a
      `throw` when a `dev-…` key was not marked `mock`. That rejected the wrong thing — a mock
      row does not have to be spelled `dev-`, and the check would have added a second source of
      truth instead of one. Instead `stampAsMock()` in `seedRows.ts` marks every row
      `insertSeedRow()` writes (the one choke point), each row builder stamps explicitly, and
      `seedHoroscopes()` re-stamps on `--force` (it does not go through `insertSeedRow`).
- [x] Rewrite `resetSeededBlogContent()` / `resetSeededKitchenContent()` to
      `DELETE ... WHERE contentSource = 'mock'` (plus deleting images referenced by the removed
      rows), so `--reset` no longer depends on `MOCK_ARTICLES` matching the database.
      ⚠️ Without this, the whole Phase A commit was a lie: `--force` deletes then re-inserts, so
      rows would silently come back as `'live'`. Deletion order is now news items → articles →
      writers, because articles embed a full author object.
      ⚠️ **`horoscopes` cannot use one honest delete.** A day's set is one row per sign behind
      `UNIQUE(date, zodiacSign)`; deleting by `contentSource` would leave a half-mock day (mock
      rows gone, live rows for the other signs still served) and the next seed would rewrite only
      the mock signs. So it stays `DELETE FROM horoscopes WHERE date = ?`, and the cost is
      documented in `resetSeededKitchenContent()`: a live set for today is removed too. That is
      acceptable for a development command and is exactly why `--reset` exists.
- [x] Tests. `types/__tests__/contentSource.test.ts` pins the two stored strings (they are a
      database contract, not an implementation detail). `scripts/seed/__tests__/seedMarking.test.ts`
      asserts every row builder — writers, articles, news items, recipes, and the whole mock data
      set rather than just the first element — carries `'mock'`; both run without a database, which
      matters because the native `better-sqlite3` binding is unavailable in some environments.
      The migration was validated against a real SQLite engine for both a fresh database and a
      legacy one: the column lands with `DEFAULT 'live'`, existing rows backfill, `NOT NULL` is
      enforced, and a re-run only hits the swallowed duplicate-column error.
      ⚠️ The planned "a `dev-…` row with `contentSource: 'live'` is rejected" test went away with
      `isSeededContentKey()`; there is nothing to reject once the seeder stamps unconditionally.
      **Not** covered by a test, and worth knowing: `better-sqlite3` cannot be built in an
      environment without a C++ toolchain, so DB-touching tests do not run there at all (this
      predates Phase A and affects `sqliteOperations.test.ts` too).

**Operational note for existing dev databases.** Rows seeded _before_ this commit were written
without the column, so they backfill to `'live'` — the one case where the default is wrong. Rebuild
once with `npm run seed:reset` (or delete the dev database) and the rows come back marked `mock`.

### Phase B — stamp from the pipeline (part of entry 6)

**Foundation and wiring landed** in `28d1624c`: the four ports, `CONTENT_SOURCE`
plumbing and both adapter sets exist, and every job in the pipeline now reaches
them through a `ports` parameter instead of importing the live services.

What that commit did **not** do — and what the remaining bullets below are — is make the
marker travel _through_ the services to the row. Only the news path stamps today
(`addNewsToTotal` writes `source.contentSource`); `blogService`, `recipeService` and
`horoscopeService` build their rows without it, `writerService` returns writers read from
the database, and `insert()` treats a missing marker as `'live'`. A mock article therefore
lands as `live` — silently, because that default is the production-correct answer for
every other caller.

- [x] Port interfaces in `types/contentPorts.d.ts` — `NewsSource`, `TextGenerator`,
      `ImageGenerator`, `TransitSource` and the `ContentPorts` bundle. Each port
      mirrors one existing service function and additionally exposes
      `readonly contentSource`, so the marker travels _with_ the data instead of
      being re-derived by the caller. That is what makes "the port was injected"
      provable from the row.
      ⚠️ `NewsSource.remainingCalls()` is a method, not a property, because the
      live token budget is a module-level `let` reset by a midnight cron; a
      snapshot taken at construction would go stale.
      ⚠️ `TransitSource` was not in the original plan's four names. The horoscope
      job cannot run without planetary positions, and leaving it hard-imported
      would have made the horoscope job the one job that still needs the network.
- [x] `config/contentSource.ts` reads `CONTENT_SOURCE`. Unset and blank → `live`,
      so a forgotten variable can never invent content. An unrecognised value
      **throws** (`InvalidContentSourceError`) rather than falling back: guessing
      would either invent content or starve the jobs, and both are silent.
- [x] Live adapters (`contentSources/live/livePorts.ts`) are pure delegation to
      `fetchNews` / `generateTextFromString` / `generateAndSaveImage` /
      `fetchAstrologicalData` — no conditionals, no new behaviour, so the live
      path stays byte-identical.
- [x] Mock adapters (`contentSources/mocks/mockPorts.ts`) are deterministic and
      offline: news pages through the canned `MOCK_NEWS_ITEMS`, text is derived
      from an FNV-1a hash of the prompt, images return a filename without writing
      bytes, and transits delegate to `buildMockAstrologicalData()`. Determinism
      is the point — a random mock would make every job assertion vacuous.
      ⚠️ **The image mock contradicts this plan's own table.** `dev-content-seeding.md`
      says the mock image writes a real local file _through_ the real compression path,
      precisely so the file/DB lifecycle keeps being exercised — and this plan's goal 1
      ("every row carries its origin") assumes a row whose image is real. The
      implementation writes no bytes: the filename is a stem that no file backs, so
      `dev-mock-image-*.webp` 404s on the client. Accepted for now because the mock's job
      is to exercise the _pipeline_, not the image path, and a placeholder tile behind a
      mock headline would look like a working site rather than a test one. Revisit in
      Phase 4 (image ownership), where the missing original is exactly the orphan case
      `images:gc` must not delete for the wrong reason. Recorded, not silently changed.
      ⚠️ The mock text says it is placeholder text. Content that reads real is
      content someone ships by accident.
- [x] `services/contentSources/index.ts` picks one set from `CONTENT_SOURCE` and
      exports it as a single `ports` object, built once. Per-call construction
      would make the live token budget look unlimited.
      ⚠️ Importing this module pulls in `newsService`, which registers a
      `node-cron` job at module scope. That keeps the event loop alive, so a
      `tsx -e` probe of `index.ts` hangs instead of exiting — verify selection in
      a test, not from the shell.
- [x] Tests: `config/__tests__/contentSource.test.ts` (parsing rules),
      `contentSources/__tests__/mockPorts.test.ts` (determinism + every port
      stamps `mock`) and `contentSources/__tests__/selection.test.ts` (the env var
      really selects the set, both ways). None needs a database or a network.
      ⚠️ A multiline `import { … } from '../mocks/mockPorts.js'` failed to resolve
      under Vitest with `ERR_MODULE_NOT_FOUND`; the same import on one line works.
      Worth knowing before the next test spends time on the wrong diagnosis.
- [x] `contentSources/__tests__/jobsTimeScale.test.ts` covers `JOBS_TIME_SCALE`
      parsing, and `jobs/__tests__/timeScaleWindows.test.ts` covers the window
      arithmetic below. `jobs/__tests__/mockPipeline.test.ts` runs the real jobs
      against the mock ports with `better-sqlite3` stubbed, and asserts the live
      text/image services are **never** called — that is what would catch a job
      that quietly went back to a direct import.
      ⚠️ `JOBS_TIME_SCALE` originally divided only the timers. `blogWriting`
      still used the hard-coded 24-hour `RECENT_NEWS_ARTICLES_TIME_THRESHOLD`, so a
      compressed run found no news inside a real day of history and logged "No
      recent real news articles found!" on a full database. The recency window is
      divided by the scale too; the test fails if that division is removed.
- [x] **Pointing the pipeline at the ports.** `newsFetching`, `blogService`,
      `recipeService`, `horoscopeService`, `featuredArticleService` and
      `writerService` take a `ContentPorts` argument (defaulting to the process's
      `ports`) and call it instead of importing `llmService` / `imageService` /
      `newsService` / `astrologyService`. Jobs pass the set down; random choices
      are injected as a `RandomBelow` so a run is reproducible from a seed.
      ⚠️ `horoscopeController` still calls `ensureHoroscopesForToday()`, which
      uses the default set rather than an explicit port. Correct under
      `CONTENT_SOURCE=mock`, but it is the one call path where the port is
      implicit rather than passed. Deferred deliberately: the _right_ fix is not to
      thread a port through a controller but to stop generating on the read path at
      all (a cron does that now that horoscopes are in the scheduler), so it is
      scheduled with that change rather than patched twice.
      ⚠️ `scheduleFeaturedArticleSelection` still fires on a literal
      `cron.schedule('0 0 * * *')`, which `JOBS_TIME_SCALE` does not compress, so
      a fast dev run will not show the daily selection firing. Same for the
      horoscope cron. Both move to the scheduler registry with a scaled
      `runOnBoot: 'if-due'` pass — the commit that closes entry 6's "compress every
      schedule" gap.
- [x] Mock adapters write rows with `contentSource: 'mock'`; live adapters with `'live'`.
      Half-true as written: the _adapters_ all expose the right marker, but only
      `newsFetching` forwarded it. Done by passing `ports.text.contentSource` into the row
      builders in `writeBlogPost` / `generateNewsArticleFromExplanation`, `generateRecipe` and
      `getRandomWriter` (which re-stamps the writer it reads, because a writer travels _inside_
      an article/recipe as a nested object and its own marker would otherwise contradict the
      row's). `seedHoroscopes()` was stamping `mock` only under `--force` and wrote a plain
      `seed:dev` day as `live` — it now always stamps.
      ⚠️ **Two writers still take the column default**, by omission rather than by decision, and
      both are reachable from outside the pipeline: `createArticle` in `adminController.ts`
      calls `writeBlogPost(writer, newsItem, true)` with no ports, and `seedWriters()` in
      `scripts/seed/seedBlogContent.ts` builds writer rows by hand instead of through
      `insertSeedRow()`. The first is _correct_ — an admin-authored article is live content by
      definition — but only until the mock set is selected, at which point it would be stamped
      `mock` by the default port without anyone choosing that. The second turned out to be a
      false alarm: `buildWriterRow()` stamps `MOCK_CONTENT_SOURCE` itself, so it survives 6.2
      unchanged. Neither is fixed here: the first needs a decision about whether an admin action
      follows `CONTENT_SOURCE` at all; the second is now enforced by 6.2's `insert()` check,
      which will reject any future hand-built row that forgets its marker.
- [x] **Make omission impossible, not just remembered.** Every bullet above was a
      "remember to pass the marker" instruction, and remembering is what failed — the row
      builder had no reason to know it was missing a field, because the column has a default.
      Done in 6.2: `insert()` now derives the marker through `contentSourceFor()`, which
      throws `MissingContentSourceError` when a row for a table in `CONTENT_SOURCE_TABLES`
      carries no marker. The error is rethrown rather than logged, because `insert()`'s other
      failure path means "not written" and this one means "fix the caller".
      ⚠️ Two things this check cannot see: it runs _after_ `dbConfig.exists()`, so a row that
      already exists is skipped before the marker is ever inspected; and it only guards
      `insert()`, so a future `UPDATE` path can still write a row the check never saw. The
      tables without the column (`foods`, `featured_blog_posts`) are opted out by the shared
      list rather than by a second list in `sqliteOperations.ts`.
- [ ] Integration test per job (entry 6's own criterion) additionally asserts the
      `contentSource` of every inserted row, so "the port was injected" is proven by data and
      not only by a `vi.mock` on `axios`. Must land **last** of the pipeline bullets: it is
      the test that proves the three above are correct.

### Phase C — fail closed

- [x] Boot check in the server: if `NODE_ENV === 'production'` and `CONTENT_SOURCE === 'mock'` →
      throw (same shape as `config/paths.ts`'s `MissingPathConfigError`, which already refuses to
      start rather than degrade).
- [x] Boot check in the server: in production, `SELECT COUNT(*) WHERE contentSource = 'mock'` on
      each table; non-zero → throw, naming the count and the `DATABASE_PATH` in use. This is the
      check that would have caught a mis-invoked compose command, and it is the only one that
      looks at the _data_ rather than at _intent_.
- [x] `assertNotProduction()` keeps its throw, and `--force` in production additionally requires
      an explicit confirmation string (`--i-know-this-is-a-demo`) instead of a single flag.
      Rationale: a flag is something you type by habit; a phrase is a decision.
- [x] Expose the count in the health endpoint (or the startup log) in every environment, so dev
      sees "mock rows: 67" instead of wondering why the feed looks odd.
- [x] Refuse non-`live` inserts inside `insert()` itself in production, not only in the
      seeder. Phase A stamps the marker but enforces nothing at write time, so today the only
      thing standing between mock content and a production database is `assertNotProduction()` in
      the seeder — which a mock content-source adapter bypasses entirely (it calls `insert`
      directly). A production `insert` that throws on `contentSource === 'mock'` closes the
      hole at the single choke point every writer already goes through, which is the same
      argument that put `stampAsMock()` in `insertSeedRow()`.
      ⚠️ **Sequencing.** Phase B adds the _precondition_ for this bullet: `insert()` must
      require a marker at all before it can refuse a bad one, otherwise "no marker" is still
      the silent `'live'` it is today and the production check has nothing to look at. Land
      the "omission is impossible" change first, then this one — they are two edits to the
      same function and reviewing them apart is what keeps the diff honest.

**Landed.** All five sit in `config/contentSourceGuard.ts`, called from `index.ts` before
`app.js` is imported — the app opens the schema at import time, so a refusal has to precede
that, which is why the app is imported dynamically after the check. Tests:
`config/__tests__/contentSourceGuard.test.ts` (decisions and the boot refusal),
`lib/database/__tests__/contentSourceRequired.test.ts` (the `insert()` refusal), and
`scripts/seed/__tests__/seedOptions.test.ts` (both gates, neither sufficient alone).

⚠️ Not verified in this sandbox: the data check against a real populated database. It runs
`COUNT(*)` through `better-sqlite3`, whose native binding cannot be built here (the same reason
11 tests in `lib/database/__tests__/sqliteOperations.test.ts` already fail). The *decision* is
tested against a stubbed count; the SQL path is exercised by the binding-equipped environment.
Confirm once by hand with a seeded DB: `NODE_ENV=production CONTENT_SOURCE=live` must exit
non-zero and name the count.

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
  force-updated row keeps whatever the previous version wrote. Implemented in Phase A:
  `insertSeedRow()` re-stamps on every write (it deletes then inserts, so the old value never
  survives), and `seedHoroscopes()` stamps explicitly because it bypasses `insertSeedRow`.
  ⚠️ **Except horoscopes on `--reset`**, which delete by date rather than by marker — see the
  Phase A note. `--force` on a day that already has live rows will therefore mark the whole day
  `mock`, which is honest: the content really was replaced.
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
  becomes a join. Examined in more detail during Phase A and rejected for two concrete reasons
  beyond drift:
  1. **It needs a type discriminator.** The five tables have no cross-table key uniqueness
     (`blog_posts.key` and `recipes.key` are both `dev-…`), so the sidecar would need a
     `(table_name, row_key)` pair — at which point it stores the same information the column
     does, one indirection further from the row, and every read still has to name its table.
  2. **It can dangle.** Foreign keys are enabled (`PRAGMA foreign_keys = ON`) but no content
     table has an FK, so nothing stops a row disappearing while its mark survives. Every delete
     path would need a second statement — `remove()` alone would silently leave orphans,
     and the production integrity check would report mock rows that no longer exist.
     The column is a strict superset: same information, one migration, no referential integrity to
     maintain by hand, and `COUNT(*)` instead of a join.
- **Trust `NODE_ENV` and skip marking entirely.** Cheapest, and it is where the project stands
  today. It only answers "was this process asked to produce fake data?", never "does this
  database contain fake data?" — and the second question is the one that matters after a
  mis-invoked `docker compose` command.
- **Delete the seeder once entry 6 lands.** Tempting (entry 6 makes it "mostly unnecessary
  ceremony"), but kept deliberately: the seeder is the known-state reset, and this plan makes it
  the one component that writes a marker it can also verify.
