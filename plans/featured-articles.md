# Featured Article: One Owner, Deterministic Hero

> **Status:** Planned · **Priority:** Medium · **Related:** `plans/dev-content-seeding.md` (Phase 1 supplies real rows), `plans/horoscope-cron-wiring.md` (single scheduler) · **Order:** not yet sequenced

## Problem

The homepage hero ("featured article") is produced by a mechanism that is date-scoped,
random, and duplicated. In dev it currently produces **an article that does not exist**.

Verified on 8 November 2026 against a fully seeded database:

```
GET /api/blogs/relevant  -> dev-article-01 ...   (real rows, links work)
GET /api/blogs/daily     -> dev-article-01 ...   (real rows, links work)
GET /api/blogs/featured  -> 0551373c-8e2f-...    (generated, never stored -> link 404s)
GET /api/blogs/hourly    -> f9fa2fad-e169-...    (generated, never stored)
```

### Current behaviour

**Storage — two mechanisms, one of them dead.**

- `blog_posts.isFeatured INTEGER DEFAULT 0` and `blog_posts.featuredDate TEXT`
  (`server/src/lib/database/schema.ts:61-91`, added as `ALTER TABLE` migrations).
- A second table `featured_blog_posts` (`schema.ts:125`) plus
  `featuredBlogDatabaseConfig` (`server/src/lib/database/databaseConfigurations.ts:77`)
  and matching branches in `sqliteOperations.ts`. **Nothing imports that config** — the
  whole path is dead.

**Write — a cron job that picks at random.**

`server/src/jobs/featuredArticleSelection.ts`:

1. `getFeaturedArticleForDate(today)` — if a pin exists for today, do nothing.
2. Otherwise take **all articles created today** (`getAllPostsAfterDate(startOfDay)`).
3. Pick one with `randomInt(todayArticles.length)`.
4. Persist `isFeatured: true` + `featuredDate: today` via `updatePost`.

Scheduled with `cron.schedule('0 0 * * *')` **and** run once at startup. Registration goes
through `initializeScheduledJobs()`, which returns early unless `ENABLE_SCHEDULED_JOBS=true`
(`server/src/jobs/scheduler.ts:15`). The dev overlay pins that to `false`, so **dev never
pins anything**.

**Write — manual override.** `PUT /api/admin/articles/:key/featured` →
`setFeaturedArticle` (`server/src/controllers/adminController.ts:303`), password-gated:
unset today's pin (`SET isFeatured = 0, featuredDate = NULL WHERE isFeatured = 1 AND
featuredDate = ?`), then set the new one. There is no un-pin-only endpoint and no history.

**Read.** `GET /api/blogs/featured?date=YYYY-MM-DD` → `getFeaturedArticleForDate`
(`server/src/services/blogService.ts:193`):

```sql
SELECT key FROM blog_posts WHERE isFeatured = 1 AND featuredDate = ? LIMIT 1
```

Exact-date match, one row, no ordering, no staleness handling. If it misses,
`getFeaturedArticleController` (`server/src/controllers/blogController.ts:192`) falls back to
`generateFakeFeaturedArticle()` — a generated article with a fresh `uuidv4()` key.

**Client.** `HomePage` fetches it once on mount and preloads the image
(`client/src/pages/HomePage/HomePage.tsx:85`); `NewspaperPrintView` renders it in the print
layout. No refetch, no retry, and a `null` hero quietly renders as nothing.

**Dev seeder.** All 20 seeded articles are written with `isFeatured: false`
(`server/src/scripts/seed/seedBlogContent.ts:68`), so the hero slot is always empty and the
endpoint always falls through to the fake generator.

### Defects this creates

1. **The hero link is broken in dev.** Generated article, UUID key, never persisted →
   `/article/<uuid>` returns 404. Clearing the browser cache cannot help: a new UUID is
   generated on every request.
2. **Selection is random, not editorial.** `randomInt` over "today's rows", no filter on
   length, head image, category or headline quality. Two databases with identical content
   produce different heroes, which makes reviews and screenshots irreproducible.
3. **The hero depends on a midnight cron firing.** If the process is down at 00:00, or jobs
   are disabled (dev, or a machine that rarely runs), today has no pin at all — and
   yesterday's pin is invisible because the read is an exact-date match.
4. **The day boundary is UTC.** `new Date().toISOString().split('T')[0]` flips "today" at UTC
   midnight (01:00/02:00 local), so the hero changes in the middle of the local evening and
   the write and read paths can disagree about which day they mean.
5. **Dead duplicate mechanism.** `featured_blog_posts` + `FeaturedArticleScheme` +
   `featuredBlogDatabaseConfig` + four `sqliteOperations` branches nobody calls.
6. **No un-pin, no history.** Only "replace today's pin". `deletePost` also leaves a pin
   pointing at a deleted row (the read path then returns `undefined` and looks like "no hero").
7. **A generated fallback hides all of the above.** The failure mode is indistinguishable
   from success at the API level, which is exactly how defect 1 survived until the seeder
   made it visible.

## Goal

- **One** storage mechanism, **one** writer, and **no generated content** in the hero path.
- The hero is always a stored, linkable row — or an explicit, honest "no hero today" state.
- Deterministic in dev: the seeder pins a known article, so reviews and screenshots are stable.
- No dependency on a cron firing at midnight: a missing pin is derived on read and persisted.

## Architecture

Keep the two columns as the single source of truth (no join, no history table needed yet) and
delete the `featured_blog_posts` path.

- **`server/src/services/featuredService.ts`** — the only module allowed to touch
  `isFeatured`/`featuredDate`:
  - `getDailyFeatured(date)` — the pinned row for that day, or `undefined`.
  - `pinDailyFeatured(key, date)` — unpin the day, pin one row, in a transaction.
  - `unpinDailyFeatured(date)` — drop today's pin (a new admin capability).
  - `ensureDailyFeatured(date)` — derive + persist when no pin exists (used by the read path
    and by the job).
- **Selection policy** (`selectFeaturedCandidate(articles)`), pure and testable: prefer
  articles that have a head image, then by `content` length, then newest — i.e. "the most
  substantial article with artwork", not a coin flip. Falls back to the newest article, and to
  `undefined` when the day is empty.
- **Day helper** (`server/src/utils/dates.ts`): one definition of "the current day string",
  taking an optional timezone offset, so write and read cannot disagree and the flip can be
  moved off UTC midnight later.
- **Read path**: `getFeaturedArticleForDate` keeps its signature; the controller calls
  `ensureDailyFeatured` before falling back, and the fake-data branch is removed once
  `dev-content-seeding.md` Phase 2 retires that flag.
- **Job**: `selectDailyFeaturedArticle()` becomes `ensureDailyFeatured(today)` — idempotent,
  safe to call from the read path, and movable into the single scheduler that
  `horoscope-cron-wiring.md` introduces.
- **Seeder**: pins `dev-article-01` for the run date and gives the two newest mocks
  `hoursAgo` < 1 so the one-hour windows have real rows too.
- **Client**: render an explicit empty hero state (no blank gap, no broken link) and refetch
  when the day changes.

## Implementation

### Phase 0 — unblock dev review (small, do this first)

- [ ] `seedBlogContent.ts`: write one article with `isFeatured: true` and `featuredDate` set to
      the run date (the seeder owns the run clock, so this stays deterministic); the rest stay
      `false`.
- [ ] Give the two newest mock articles `hoursAgo: 0.5` and `1` so `/api/blogs/by-minute` and
      `/api/blogs/hourly` stop falling back.
- [ ] Seeder test: exactly one `isFeatured = 1` row for the run date, and at least two rows
      inside the last hour.
- [ ] Set `ENABLE_FAKE_DATA=false` for the verified dev flow and repeat the homepage check.

### Phase 1 — one mechanism, no dead code

- [ ] Add `featuredService.ts` and route `featuredArticleSelection.ts`, `setFeaturedArticle`
      and `blogService.getFeaturedArticleForDate` through it.
- [ ] Delete `featuredBlogDatabaseConfig`, `FeaturedArticleScheme`, the `featured_blog_posts`
      branches in `sqliteOperations.ts` and the table creation, plus an explicit
      `DROP TABLE IF EXISTS featured_blog_posts` migration.
- [ ] Guard the invariant with a partial unique index on `blog_posts(featuredDate)` for the rows
      where `isFeatured = 1`, so a day can only ever hold one pin.
- [ ] `deletePost` clears a pin that points at the deleted row.

### Phase 2 — deterministic selection and lazy derivation

- [ ] `selectFeaturedCandidate()` with unit tests (empty day, single article, tie-breaks,
      no-image articles).
- [ ] `ensureDailyFeatured()` called from the read path, so a missed midnight run self-heals
      and the pin stays stable for the rest of the day.
- [ ] Replace the `toISOString()` day computation with `utils/dates.ts`; document the
      UTC-vs-local decision explicitly.

### Phase 3 — admin control

- [ ] `PUT /api/admin/featured/:key` and `DELETE /api/admin/featured` (un-pin), both
      password-gated, both returning the resulting state.
- [ ] Admin UI: current pin, "pin this article", "unpin", and why the article was chosen.
- [ ] Keep `PUT /api/admin/articles/:key/featured` as a thin alias or migrate the admin client
      in the same commit — never two write paths.

### Phase 4 — retire the generated fallback

- [ ] Remove the `generateFakeFeaturedArticle()` branch from `getFeaturedArticleController`
      together with `dev-content-seeding.md` Phase 2.
- [ ] Integration test: `/api/blogs/featured` on an empty database returns
      `{ success: true, article: null }` (or 204), never a generated article.

## DevOps Impact

- No new environment variables; no compose or nginx change.
- The job stays inside the existing `ENABLE_SCHEDULED_JOBS` gate, so dev keeps it off and the
  read-path derivation is what fills the hero.
- One SQLite migration (drop the unused table, add the partial unique index), applied by the
  existing `initializeSchema()` on boot.
- No impact on images or file storage; the pinned article's image is already seeded.

## Testing

- **Unit:** selection policy; `featuredService` pin/unpin/derive idempotency; the day helper
  across a UTC/local boundary.
- **Integration:** two consecutive `GET /api/blogs/featured` calls return the same key; a
  simulated next-day request re-pins once; an un-pinned day derives instead of 404ing; a pin
  pointing at a deleted row is cleaned up.
- **Contract:** `/api/blogs/featured` never returns a key absent from `blog_posts`.
- **E2E (Playwright):** the homepage hero image loads and its link returns 200.
- **Seeder:** exactly one pin per run date after `seed:dev`, and again after `seed:reset`.

## Security

- Both write endpoints keep the existing `validatePassword` gate; no new auth surface.
- Pin only articles that exist (already the case); the key is a lookup, not a URL, so there is
  no SSRF surface.
- Rate-limit the admin endpoints together with the rest of `/api/admin`.
- No draft/unpublished leakage: the hero query must keep whatever visibility predicate the
  blog list uses once drafts exist.

## Edge Cases

- No articles at all today (fresh database, jobs never ran) → derive from the last N days, or
  return an explicit empty hero.
- Multiple pins for one day (manual override racing the cron) → the partial unique index makes
  this impossible; both writes are transactional.
- Pin points at a deleted article → cleared by `deletePost`, and `ensureDailyFeatured`
  recovers on the next read.
- Clock skew / UTC-vs-local midnight → one day helper, one decision, tested.
- Database restored from a backup containing yesterday's pin → today's derived pin replaces
  nothing; yesterday's row stays untouched.
- `featuredDate` NULL with `isFeatured = 1` (pre-migration rows) → treat as "no pin" and clean
  it up on the next write.

## Alternatives

- **Make `featured_blog_posts` the source of truth.** Rejected: it duplicates `blog_posts`
  rows (content, author, image) and buys nothing today — the only real gap is history, which a
  `featured_history` table can add later without a second copy of the article.
- **Always derive on read, never persist.** Cheapest build, but it destroys the editorial
  override ("this one, today") and makes the hero jump whenever the scoring changes.
- **Keep `randomInt`.** Rejected: non-reproducible reviews and screenshots, and it can feature
  a stub over a substantial article.
- **Leave the fake fallback in place and only seed a pin.** Rejected: it keeps the failure
  mode indistinguishable from success, which is what hid this bug until now.
