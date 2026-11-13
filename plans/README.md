# Plans

This directory contains planning documents for future features, architectural changes, and improvements to Real Fake News.

> **Read first:** [`../AGENTS.md`](../AGENTS.md) and the human-only contracts in
> [`../contracts/`](../contracts/) — `design.md`, `architecture.md`, `environment.md`. They state
> facts a plan may not contradict. Nothing inside `contracts/` is editable by an agent.

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
      file into the program). _Landed as `73790b05`._ The rest of the entry followed in the
      "delete trash" pass: `server/src/models/admin.ts` (a Mongoose model no code imported) with
      `mongoose`, `@types/mongoose`, `bcrypt`, `@types/bcrypt` and the never-imported `sharp`, and the
      fully commented-out `services/specialArticleService.ts`, `controllers/authController.ts`,
      `routes/auth.ts`, `middleware/auth.ts`, plus the LowDB path block in `config/constants.ts` and
      the dead prompt copies in `blogService.ts` and `featuredArticleService.ts`.
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
      the dev overlay. One source of fake content: the seeder reads the same `mockContent.ts` the
      adapters do, and `--reset` deletes rows by their `contentSource` marker rather than by
      guessing at `dev-` prefixes.
- [x] **6. Inject content-source ports so jobs run without API keys.**
      `NewsSource`/`TextGenerator`/`ImageGenerator`/`TransitSource` behind ports, `live` vs `mock`
      selected by `CONTENT_SOURCE`, with `JOBS_TIME_SCALE` compressing the windows the jobs measure
      their output over. A dev stack with no API keys now writes articles, recipes, horoscopes and
      news through the same job code production runs — the only difference is which adapter is
      bound. _Landed 9–11 November 2026_ (`8f8c5ecb`, `28d1624c`, `b0813000`, and the commits
      behind 6.2–6.5).

      What the entry turned out to involve, kept here because the two plan files that documented
      it (`dev-content-seeding.md`, `dev-content-marking.md`) are now retired:

      - **The marker column.** `contentSource TEXT NOT NULL DEFAULT 'live'` on the five content
        tables, indexed so "how many mock rows?" is a real `COUNT(*)`. `foods` and
        `featured_blog_posts` are deliberately unmarked — a food row is just a name fed into a
        recipe prompt, and the featured table is dead. Persistence had to be fixed too: `insert`
        did not write the column originally, so every mock row would have landed as `live`.
      - **Stamping at the write.** `blogService`/`recipeService` stamp their rows;
        `getRandomWriter` re-stamps the writer it reads so a nested author cannot contradict its
        article; `seedHoroscopes()` stamps `mock` unconditionally. `insert()` throws
        `MissingContentSourceError` for a row on a marked table with no marker — omission is
        impossible rather than merely discouraged.
      - **Per-source counting.** The jobs early-return when a table looks full, so with a seeded
        database a correct mock adapter would have been asked for zero items forever.
        `contentSourceQueries.ts` now answers "rows *this source* produced today", and
        `ensureHoroscopesForToday()` counts its own twelve rather than the literal 12.
      - **The token budget** became `LiveNewsSource` instance state instead of a module-level
        `let`, so a mock is never short-circuited by the live counter and the news path stopped
        being order-dependent in tests.
      - **Failing closed** (`config/contentSourceGuard.ts`, called from `index.ts` before `app.js`
        is imported, because the app opens the schema at import time): production refuses to boot
        with `CONTENT_SOURCE=mock`, refuses to boot with mock rows in the database (naming the
        count and the `DATABASE_PATH`), and `insert()` refuses a mock write in production. `--force`
        in production needs the explicit phrase `--i-know-this-is-a-demo`. Every environment logs
        the mock-row count at boot.

      _Open from this entry, deliberately deferred:_ **(6.6)** put both `0 0 * * *` crons behind
      `JOBS_TIME_SCALE` — now folded into roadmap entry 8, since it is the same scheduler wiring;
      **(6.7)** the per-job integration test asserting each row's `contentSource` — one of the
      tests in the "Still to add" step at the end of this file. _Not verified in this sandbox:_
      the production data check against a real populated database — it runs `COUNT(*)` through
      `better-sqlite3`, whose native binding cannot be built here. The decision is tested against
      a stubbed count; confirm once by hand with a seeded DB that
      `NODE_ENV=production CONTENT_SOURCE=live` exits non-zero and names the count.

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
      random content; `blogController.test.ts` pins both answers. The two deviations from the
      original plan: the whole module went (see above), and the empty-database answer for the
      by-key routes stayed a `404` rather than being re-decided.
- [ ] **8. Wire the daily horoscope job into one scheduler.** Job registry + if-due guard, move
      `initializeScheduledJobs()` out of `app.ts` module scope →
      `plans/horoscope-cron-wiring.md`. **Also folded in here** (was 6.6): both `0 0 * * *` crons —
      featured selection and horoscopes — must go behind the scheduler so `JOBS_TIME_SCALE`
      compresses them. Today `featuredArticleSelection.ts` registers its own cron and the horoscope
      job is registered by nothing, so a compressed dev day still waits until real midnight for the
      hero and never generates horoscopes at all. This is the same wiring, so it lands with it.
- [ ] **9. Give image files an owner.** Store `headImage` as a filename (already the case) and have
      `remove` delete the original + compressed copy, plus `npm run images:gc` to sweep files in
      `IMAGES_PATH` that no row references. Document the rule in `docs/configuration.md`: images are
      owned by rows, not by requests — so a request that fails never orphans a file, and a deleted
      row is the only thing that should delete its image.
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

| File                             | Status     | Priority | Description                                                                             |
| -------------------------------- | ---------- | -------- | --------------------------------------------------------------------------------------- |
| `admin-server-side-auth-gate.md` | Planned    | High     | Prevent admin frontend from being served without valid password                         |
| `horoscope-cron-wiring.md`       | Planned    | High     | Horoscopes are never generated: wire the dead daily job into one declarative scheduler  |
| `featured-articles.md`           | Planned    | Medium   | One owner for the daily hero: pin/unpin, deterministic selection, no generated fallback |
| `api-origin-and-rest-shape.md`   | Discussion | Low      | Subdomains, one-origin-per-env, and which endpoints deserve a REST shape                |
| `features-status.md`             | Reference  | —        | Living inventory of merged vs. abandoned features and where each one lives in the code  |

### Plans retired once their work landed

Each was deleted because it described no outstanding work. Where its content still had value, it
moved rather than vanished:

| Deleted                                    | Why                                                                            | Where it went                                   |
| ------------------------------------------ | ------------------------------------------------------------------------------ | ----------------------------------------------- |
| `testing-suite.md`                         | Completed; was a plan to _add_ a suite, and the suite exists                   | `TESTING.md`, and PR #7 in `features-status.md` |
| `absolute-clock-cron-scheduler-rundown.md` | Described a branch that never landed; superseded by `horoscope-cron-wiring.md` | The branch itself (see `features-status.md`)    |
| `dev-content-seeding.md`                   | Phase 1–3 landed; 6.6 moved to entry 8, Phase 4 became entry 9                 | Entries 5, 6, 8 and 9 above                     |
| `dev-content-marking.md`                   | Phases A–C landed; the one open test is in "Still to add" below                | Entry 6 above                                   |

Nothing in this directory should outlive its own work. If a plan is finished, delete it and leave a
line in the roadmap saying what landed — a directory of documents that are all _almost_ current is
worse than a short one, because the stale sentence is the one people read.

## Feature Status

`features-status.md` is not a plan — it is an inventory of what already shipped on `main`, which
feature branches were merged (and then deleted), and which branches were abandoned. Update it when a
feature lands or a branch is retired.

## Still to add — tests, whenever someone has the time

Not a roadmap entry and not a blocker for anything above. 155 tests pass today; these are the gaps
worth closing first if you find yourself writing tests anyway. Add them opportunistically, next to
the code they touch, rather than as a project.

1. **Every job gets one row-level test.** Run the job against `CONTENT_SOURCE=mock` and assert that
   rows actually landed in SQLite, including each row's `contentSource`. Today
   `jobs/__tests__/mockPipeline.test.ts` proves _which services were called_ with `better-sqlite3`
   stubbed, which is why a mock row could have landed as `live` without a test noticing — the
   write path itself went wrong once already (see entry 6). This is the one test that proves the
   adapters work, so it earns its native dependency.
2. **The production data check, by hand at least once.** `checkContentSourceAtBoot()` decides against
   a stubbed count; the real `COUNT(*)` path has never run here because the native binding cannot be
   built in this sandbox. With a seeded DB, `NODE_ENV=production CONTENT_SOURCE=live` must exit
   non-zero and name the count and `DATABASE_PATH`.
3. **Anything you had to reason about twice while debugging.** The bug that took an hour to find is
   usually the one worth a five-line test — not the function you just wrote, which you already know
   works because you just ran it.

What _not_ to do: don't chase coverage percentages, and don't write a test that only restates the
implementation (`expect(x).toBe(valueThatXIsComputedWith)`). A test earns its place by pinning
something a future change could plausibly break silently.
