# Plans

This directory contains planning documents for future features, architectural changes, and improvements to Real Fake News.

## Purpose

Each markdown file in this directory describes a planned feature or change in detail — including the problem, proposed solution, implementation details, files to modify, DevOps impact, and testing strategy.

These documents serve as a reference for:

- Understanding what changes are planned and why
- Onboarding new developers to upcoming work
- Tracking design decisions and alternatives considered
- Coordinating with DevOps on infrastructure changes

## Current session — 7 November 2026

The work for this session has one agreed order. **Each entry below is exactly one commit** — with
one deliberate exception: entries 2 and 3 landed as a single commit, because they edit the same
four docs files (`docker-compose.yml`, `scripts/bootstrap.sh`, `docs/configuration.md`, `README.md`)
hunk for hunk, and splitting them would mean hand-authoring intermediate versions of those files
for no review benefit. Entry 1 landed as `73790b05`.

- [x] **1. Delete dead code, stale build output and unused dependencies.** Repo-root `database/`
      folder, `server/src/scripts/migrateToSqlite.ts`, the legacy CJS `server/src/config/constants.js`
      plus its stale `server/dist/` copies (a `prebuild` clean now prevents new ones), the dead
      `seed` npm script (`node data/seed-data.js` — no such file), and the now-dead
      `"allowJs": true` in `server/tsconfig.json` (it only ever existed to pull that one legacy
      file into the program). _Landed as `73790b05`._ Still to do inside
      the same commit: `server/src/models/admin.ts` + `mongoose` + `@types/mongoose`, and the
      commented-out LowDB/DeepSeek blocks in `specialArticleService.ts` and `constants.ts`.
- [x] **2. Require `DATABASE_DIR` and `IMAGES_DIR`; no default host directory.** `docker-compose.yml`
      fails on a missing value (`${VAR:?…}`), `scripts/bootstrap.sh` stops before creating
      anything, `.env`/`.env.example`/docs say "required". _Landed with entry 3._
- [x] **3. Require `DATABASE_PATH` and `IMAGES_PATH`; no default data location.**
      `config/paths.ts` throws `MissingPathConfigError`, `config/env.ts` exports `SERVER_ROOT`,
      bootstrap checks `server/.env`, `paths.test.ts` asserts the throws, docs updated.
      _Landed with entry 2._

_Where entries 2–3 stand:_ both are committed together — they were one working-tree change-set and
their doc hunks interleave. Commit 1 needed `server/src/scripts/README.md` split by hand: its
`migrateToSqlite.ts` removals went into `73790b05`, its `## Database Location` rewrite went with
entry 3. The snapshots in `~/.cache/rfn-stage23/` are historical backups only; do not apply them on
top of `73790b05`.

- [x] **4. Fix the nginx proxy: forward the request URI.** `proxy_pass $backend_server$request_uri;`
      in `client/nginx.conf` and `admin/nginx.conf` — with a variable in `proxy_pass` nginx drops
      the URI, so every `/api/*` arrives as `GET /api` and 404s. Needed to verify anything else.
- [x] **5. Add a deterministic dev seeder backed by mock content.** `seedDevData.ts` +
      `contentSources/mocks/mockContent.ts`, `seed:dev`/`seed:reset`, one-shot `seed` service in
      the dev overlay → `plans/dev-content-seeding.md` Phase 1.
- [ ] **6. Inject content-source ports so jobs run without API keys.**
      `NewsSource`/`TextGenerator`/`ImageGenerator`/`TransitSource`, `live` vs `mock` selected by
      `CONTENT_SOURCE`, `JOBS_TIME_SCALE`, one integration test per job → Phase 3.
      _Prerequisite:_ ~~`plans/dev-content-marking.md` Phase A (a persisted `contentSource`
      column)~~ — **done 9 November 2026** (`8f8c5ecb`), so this entry is unblocked: the column
      exists on all five content tables, seeded rows are stamped `mock`, `--reset` deletes by
      marker, and `insert`/`findAll`/`findOne` round-trip the value. Dev databases seeded before
      it need one `npm run seed:reset` to re-stamp their rows (they backfilled as `live`).
      _Adapters and `CONTENT_SOURCE` landed 11 November 2026 (`28d1624c`)._ Remaining, in order:
      **(6.1) done** (`b0813000`) — `blogService`/`recipeService` stamp their rows,
      `getRandomWriter` re-stamps the writer it reads so a nested author cannot contradict its
      article, and `seedHoroscopes()` stamps `mock` unconditionally instead of only under
      `--force`; **(6.2) done** — `insert()` throws `MissingContentSourceError` for a row on a
      marked table with no marker, opting out `foods`/`featured_blog_posts` through the shared
      `CONTENT_SOURCE_TABLES` list; **(6.3) done** — `getAllPostsAfterDateBySource()` counts what
      one pipeline produced, `getAllNewsArticlesAfterDate()` takes an origin, and
      `ensureHoroscopesForToday()` counts its own twelve, so a seeded table no longer answers
      "quota met" for a pipeline that has produced nothing; **(6.4) done** — the daily token
      budget is `LiveNewsSource` instance state, and `fetchNews()` no longer meters anything;
      **(6.5)** `plans/dev-content-marking.md` Phase C boot refusals + the
      mock-row count in the startup log; **(6.6)** put both `0 0 * * *` crons behind
      `JOBS_TIME_SCALE`; **(6.7)** per-job integration test asserting each row's `contentSource`.
      **6.7 is last on purpose** — it is the test that proves 6.1–6.3 were done, so it lands after
      the code it checks, and the entry is ticked only when it passes.

- [x] **7. Delete the read-time `ENABLE_FAKE_DATA` fallback.** Guards removed from
      `blogController` (5), `recipeController` (3), `horoscopeController` (1); fake generators
      deleted (`generatePlaceholderImage()` stays); compose default dropped → Phase 2.
      _Decision:_ delete the flag outright (planned) — if we keep it, it must default to `false`
      and be read only by the dev overlay. **Taken: deleted outright.**
      _Landed:_ the whole of `services/fakeDataService.ts` is gone, including
      `generatePlaceholderImage()` — with the flag deleted that wrapper could only ever return
      `''`, so the CLI that used it now calls `createTilePlaceholderImage()` directly. The flag
      is out of `docker-compose.yml`, both `.env.example` files, `README.md`, `server/README.md`
      and `docs/configuration.md`; the last of those gained the `CONTENT_SOURCE` row that should
      have been there since Phase 3. An empty database is now an empty list / `404`, never
      random content; `blogController.test.ts` pins both answers. See
      `plans/dev-content-seeding.md` Phase 2 for the deviations.
- [ ] **8. Wire the daily horoscope job into one scheduler.** Job registry + if-due guard, move
      `initializeScheduledJobs()` out of `app.ts` module scope →
      `plans/horoscope-cron-wiring.md`.
- [ ] **9. Give image files an owner.** `remove` removes the original + compressed copy,
      `npm run images:gc` deletes unreferenced files → `plans/dev-content-seeding.md` Phase 4.
- [ ] **10. Serve the API from the frontend origin (relative `/api` only).** Stop baking
      `VITE_API_BASE_PROD=http://server:5001` into the bundles → `plans/api-origin-and-rest-shape.md`.
- [ ] **11. Reshape the endpoints that deserve a REST path.** The handful of routes listed in the
      same plan; everything else stays as-is.
- [ ] **12. Document subdomain + TLS as the recommended deployment.** nginx server blocks,
      `ALLOWED_ORIGINS`, `docs/configuration.md`.

Why this order: 1–3 are pure deletions and removals of defaults (mechanical, tiny diffs, and
everything later builds on the stricter config); 4 is a two-line bugfix that otherwise hides the
result of every later step; 5–7 give dev a real write path and only then retire the read-time
crutch; 8–9 finish the job layer; 10–12 touch the fewest files last, so a late change of mind is
cheap.

## Not yet ordered — next session

These are agreed but deliberately unsequenced, so they stay out of the 7 November commit order:

- [ ] **13. Give the featured article one owner.** Today it is a random `randomInt` pick by a
      midnight cron into `blog_posts.isFeatured`/`featuredDate`, duplicated by a dead
      `featured_blog_posts` table, and masked in dev by `generateFakeFeaturedArticle()`
      returning a UUID that was never persisted. Phase 0 (seeder pins one article, two
      articles inside the last hour) unblocks dev review immediately; then one service,
      deterministic selection, lazy derivation on read, and admin pin/unpin →
      `plans/featured-articles.md`.

## Convention

- Each file is named `kebab-case-description.md`
- Each begins with a status badge (`Planned`, `In Progress`, `Completed`, `Deprecated`)
- Each covers: Problem → Goal → Architecture → Implementation → DevOps Impact → Testing → Security → Edge Cases → Alternatives
- Steps and features are written as `- [ ]` checklists so progress is visible in a diff
  (tick items with `- [x]` as they land, no separate status tracking)

## Current Plans

| File                             | Status      | Priority | Description                                                                                                        |
| -------------------------------- | ----------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `admin-server-side-auth-gate.md` | Planned     | High     | Prevent admin frontend from being served without valid password                                                    |
| `horoscope-cron-wiring.md`       | Planned     | High     | Horoscopes are never generated: wire the dead daily job into one declarative scheduler                             |
| `dev-content-seeding.md`         | In Progress | High     | Deterministic dev seeder, removal of `ENABLE_FAKE_DATA`, content-source adapters (Phases 0–3 done; 6.6 crons and Phase 4 open) |
| `dev-content-marking.md`         | In Progress | High     | Persist a `contentSource` column so fake rows are provable, and prod refuses to boot with them (Phases A–C done) |
| `featured-articles.md`           | Planned     | Medium   | One owner for the daily hero: pin/unpin, deterministic selection, no generated fallback                            |
| `api-origin-and-rest-shape.md`   | Discussion  | Low      | Subdomains, one-origin-per-env, and which endpoints deserve a REST shape                                           |
| `features-status.md`             | Reference   | —        | Living inventory of merged vs. abandoned features and where each one lives in the code                             |

### Two plans were deleted on 11 November 2026

`testing-suite.md` (Completed) and `absolute-clock-cron-scheduler-rundown.md` (Planned, never
started). Neither described outstanding work. The testing plan's lasting content — how to run the
suites, file conventions, the Vitest/Vite warning — lives in `TESTING.md`, and `features-status.md`
records the suite as shipped via PR #7. The cron-scheduler rundown described a branch that never
landed and was superseded by `horoscope-cron-wiring.md`; `features-status.md` now points at the
branch itself, which is the only remaining record of that design.

## Feature Status

`features-status.md` is not a plan — it is an inventory of what already shipped on `main`, which
feature branches were merged (and then deleted), and which branches were abandoned. Update it when a
feature lands or a branch is retired.
