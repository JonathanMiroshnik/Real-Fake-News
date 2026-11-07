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

The work for this session has one agreed order. **Each entry below is exactly one commit** — do
not mix two entries into a single commit even when the diff is small, so every step can be
reviewed, reverted and bisected on its own. Entry 1 _(staged)_ is already edited in the working
tree and only needs committing; entries 2–3 were edited as well but are now parked in
`git stash@{0}` so that commit 1 lands alone (restore instructions under entry 3).

- [ ] **1. Delete dead code, stale build output and unused dependencies.** Repo-root `database/`
      folder, `server/src/scripts/migrateToSqlite.ts`, the legacy CJS `server/src/config/constants.js`
      plus its stale `server/dist/` copies (a `prebuild` clean now prevents new ones), the dead
      `seed` npm script (`node data/seed-data.js` — no such file), and the now-dead
      `"allowJs": true` in `server/tsconfig.json` (it only ever existed to pull that one legacy
      file into the program). _(staged)_ Still to do inside
      the same commit: `server/src/models/admin.ts` + `mongoose` + `@types/mongoose`, and the
      commented-out LowDB/DeepSeek blocks in `specialArticleService.ts` and `constants.ts`.
- [ ] **2. Require `DATABASE_DIR` and `IMAGES_DIR`; no default host directory.** `docker-compose.yml`
      fails on a missing value (`${VAR:?…}`), `scripts/bootstrap.sh` stops before creating
      anything, `.env`/`.env.example`/docs say "required". _(parked in `stash@{0}`)_
- [ ] **3. Require `DATABASE_PATH` and `IMAGES_PATH`; no default data location.**
      `config/paths.ts` throws `MissingPathConfigError`, `config/env.ts` exports `SERVER_ROOT`,
      bootstrap checks `server/.env`, `paths.test.ts` asserts the throws, docs updated.
      _(parked in `stash@{0}`)_

> **Restoring 2–3:** `git stash pop` brings back all 11 files. `server/src/scripts/README.md` had
> to be split by hand (its `migrateToSqlite.ts` removals belong to commit 1, its `## Database
Location` rewrite to commit 3), so that one paragraph is _not_ in the stash — re-apply it with
> `git apply ~/.cache/rfn-stage23/stage3-scripts-readme.patch`. A full backup of both stages as a
> single diff (pre-split) is at `~/.cache/rfn-stage23/stage23-full.patch`. Restoring a single file
> instead: `git stash show -p stash@{0} -- <path> | git apply`.

- [ ] **4. Fix the nginx proxy: forward the request URI.** `proxy_pass $backend_server$request_uri;`
      in `client/nginx.conf` and `admin/nginx.conf` — with a variable in `proxy_pass` nginx drops
      the URI, so every `/api/*` arrives as `GET /api` and 404s. Needed to verify anything else.
- [ ] **5. Add a deterministic dev seeder backed by mock content.** `seedDevData.ts` +
      `contentSources/mocks/mockContent.ts`, `seed:dev`/`seed:reset`, one-shot `seed` service in
      the dev overlay → `plans/dev-content-seeding.md` Phase 1.
- [ ] **6. Inject content-source ports so jobs run without API keys.**
      `NewsSource`/`TextGenerator`/`ImageGenerator`/`TransitSource`, `live` vs `mock` selected by
      `CONTENT_SOURCE`, `JOBS_TIME_SCALE`, one integration test per job → Phase 3.
- [ ] **7. Delete the read-time `ENABLE_FAKE_DATA` fallback.** Guards removed from
      `blogController` (5), `recipeController` (3), `horoscopeController` (1); fake generators
      deleted (`generatePlaceholderImage()` stays); compose default dropped → Phase 2.
      _Decision:_ delete the flag outright (planned) — if we keep it, it must default to `false`
      and be read only by the dev overlay.
- [ ] **8. Wire the daily horoscope job into one scheduler.** Job registry + if-due guard, move
      `initializeScheduledJobs()` out of `app.ts` module scope →
      `plans/horoscope-cron-wiring.md`.
- [ ] **9. Give image files an owner.** `deletePost` removes the original + compressed copy,
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

## Convention

- Each file is named `kebab-case-description.md`
- Each begins with a status badge (`Planned`, `In Progress`, `Completed`, `Deprecated`)
- Each covers: Problem → Goal → Architecture → Implementation → DevOps Impact → Testing → Security → Edge Cases → Alternatives
- Steps and features are written as `- [ ]` checklists so progress is visible in a diff
  (tick items with `- [x]` as they land, no separate status tracking)

## Current Plans

| File                             | Status     | Priority | Description                                                                            |
| -------------------------------- | ---------- | -------- | -------------------------------------------------------------------------------------- |
| `testing-suite.md`               | Completed  | High     | Full testing suite: Vitest (unit/integration) + Playwright (E2E) across all workspaces |
| `admin-server-side-auth-gate.md` | Planned    | High     | Prevent admin frontend from being served without valid password                        |
| `horoscope-cron-wiring.md`       | Planned    | High     | Horoscopes are never generated: wire the dead daily job into one declarative scheduler |
| `dev-content-seeding.md`         | Planned    | High     | Deterministic dev seeder, removal of `ENABLE_FAKE_DATA`, content-source adapters       |
| `api-origin-and-rest-shape.md`   | Discussion | Low      | Subdomains, one-origin-per-env, and which endpoints deserve a REST shape               |
| `features-status.md`             | Reference  | —        | Living inventory of merged vs. abandoned features and where each one lives in the code |

## Feature Status

`features-status.md` is not a plan — it is an inventory of what already shipped on `main`, which
feature branches were merged (and then deleted), and which branches were abandoned. Update it when a
feature lands or a branch is retired.
