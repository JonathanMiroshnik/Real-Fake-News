> **Status:** Reference (living document)

# Feature Status Inventory

Plain-language inventory of what actually exists on `main`, what arrived through merged
branches, and what was started but never landed.

- Snapshot taken from: `main` @ `a60d0865` (2026-05-25), 171 commits, first commit 2025-04-13.
- **Why this file exists:** deleting a merged branch only removes the branch _label_; the commits
  stay reachable from `main`. This file keeps the human-readable "what was that branch for?"
  answer alive after the branch name is gone.
- Single bug fixes, formatting runs and dependency bumps are intentionally **not** listed. Only
  things a user/operator can see or that change how the app is built and shipped are listed.

## How to verify anything in this file

```bash
git log --oneline --merges                       # branch-name provenance of every merge
git log --oneline -20                            # latest work
git branch -r --merged origin/main               # branches fully contained in main
git log --oneline origin/main..origin/<branch>   # work not yet in main
```

## 1. Shipped through merged branches (branches now deleted)

Every branch below had **0 commits** that were not already in `main`, so deleting it lost nothing.
The merge commits (`Merge pull request #N from JonathanMiroshnik/<branch>`) still sit in `main`'s
history and still name the branch they came from.

| #   | Branch (deleted)                       | PR         | Merged     | What it shipped, in plain terms                                                                                                                                                |
| --- | -------------------------------------- | ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `vps-deployment`                       | #1         | 2026-05-02 | Real production deployment on `real.sensorcensor.xyz`: client/server/admin containers, shared `devops_shared` network, no host ports, health checks removed (nginx handles it) |
| 2   | `pre-commit-guardrails`                | #2         | 2026-05-02 | Pre-commit guardrails: Prettier + ESLint + lint-staged + husky hooks; stale `node_modules` removed from git tracking                                                           |
| 3   | `lint-fix-9afeb`                       | #3         | 2026-05-02 | Codebase-wide lint/format cleanup so the new hooks pass                                                                                                                        |
| 4   | `admin-panel-react-rewrite`            | #4         | 2026-05-02 | Admin panel rewritten from Svelte to React with a design system (Dashboard, Article editor, Settings, Site configuration)                                                      |
| 5   | `admin-panel-subdomain`                | #5         | 2026-05-02 | Admin panel served on its own subdomain (`admin.real.sensorcensor.xyz`) instead of a `/admin` proxy path                                                                       |
| 6   | `plans-directory`                      | #6         | 2026-05-04 | The `plans/` directory itself, plus the admin server-side auth gate plan                                                                                                       |
| 7   | `feature/testing-suite`                | #7         | 2026-05-08 | Full test suite: Vitest unit/integration, Playwright E2E, `TESTING.md`, `playwright.config.ts`                                                                                 |
| 8   | `database-config-cleanup`              | #8         | 2026-05-09 | One consolidated database config, docker compose and env-file layout, documented DB directory permissions                                                                      |
| 9   | `fix/dockerfile-package-normalization` | #9         | 2026-05-16 | Normalized Dockerfiles and `package.json` files across the three workspaces                                                                                                    |
| 10  | `fix/ci-typecheck-and-formatting`      | #10        | 2026-05-16 | GitHub Actions CI pipeline made green: typecheck/lint/build, `workspaces` field dropped, unused `langchain` deps and dead `ChatDeepSeek` code removed                          |
| 11  | `search-capability`                    | — (direct) | 2025-10-22 | **Nothing functional** — only README/feature-list edits. Search was never implemented and is still an open checkbox in the README                                              |

## 2. Features that landed straight on `main` (no feature branch)

These were committed to `main` directly, so there is no branch to remember — only commits. Grouped
by area, with one representative commit as evidence.

### 2.1 Content generation (backend)

| Feature                                                                                                                                                                | Where it lives                                                 | Evidence               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------- |
| LLM writing pipeline (OpenAI → DeepSeek `deepseek-reasoner`)                                                                                                           | `server/src/services/llmService.ts`                            | `a83d214b`, `c0316f2f` |
| Real-news ingestion for prompts (newsdata.io)                                                                                                                          | `services/newsService.ts`, `jobs/newsFetching.ts`              | `c44fc90c`, `bf44bfa7` |
| Separate news-fetching and blog-writing jobs                                                                                                                           | `jobs/newsFetching.ts`, `jobs/blogWriting.ts`                  | `5179b187`             |
| Recurring jobs actually wired: article generation (≈8h), news fetching (≈2h), recipe generation (daily), featured-article selection — gated by `ENABLE_SCHEDULED_JOBS` | `jobs/scheduler.ts`                                            | `4824977d`             |
| Horoscope generation job module (present but **not** wired into the scheduler on `main`)                                                                               | `jobs/horoscopeGeneration.ts`                                  | not imported anywhere  |
| Featured-article selection (automatic + admin control)                                                                                                                 | `services/featuredArticleService.ts`                           | `e95a5ecd`, `ac9248d7` |
| Recipe generation                                                                                                                                                      | `services/recipeService.ts`, `jobs/recipeGeneration.ts`        | `dfc174ca`             |
| Horoscope / astrology generation                                                                                                                                       | `services/astrologyService.ts`, `services/horoscopeService.ts` | `694659e5`             |
| Long-form "special articles"                                                                                                                                           | `services/specialArticleService.ts`                            | file on `main`         |
| Writer personas (names, bios, per-writer pages)                                                                                                                        | `services/writerService.ts`, `client/src/pages/WriterPage`     | `f5369bd2`             |
| AI image generation (runware.ai) + webp support                                                                                                                        | `services/imageService.ts`                                     | `53b1bb0a`, `6b87b790` |
| Fake-data fallback mode (`ENABLE_FAKE_DATA`, `Synthesis` writer)                                                                                                       | `services/fakeDataService.ts`                                  | `11e69efb`, `5464d319` |
| Tiled placeholder-image generator + CLI (`npm run generate-fake-image`)                                                                                                | `server` scripts                                               | `a741113d`, `9aeb0c22` |
| Database mock-data generator for local dev                                                                                                                             | `server` scripts                                               | `8cc63595`             |

### 2.2 Public website (client, React)

| Feature                                                                         | Where it lives                                     | Evidence                           |
| ------------------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------- |
| Home page: lead article + section/sidebar layout                                | `client/src/pages/HomePage`, `SectionWithSidebars` | `7812a0dc`, `85d20172`             |
| News carousel / ticker                                                          | `components/NewsCarousel`                          | `dc0fc7c7`                         |
| Featured article block                                                          | `components/FeaturedArticle`                       | `ac9248d7`                         |
| Article page (markdown body, author, timestamp)                                 | `pages/ArticlePage`                                | `7812a0dc`                         |
| Category pages                                                                  | `pages/CategoryPage`                               | `CategoryPage`                     |
| Writer pages                                                                    | `pages/WriterPage`                                 | `f5369bd2`                         |
| Recipe section + recipe pages                                                   | `components/RecipeSection`, `pages/RecipePage`     | `dfc174ca`, `76aecb83`             |
| Horoscope section                                                               | `components/Horoscope`                             | `694659e5`                         |
| Games section (tic-tac-toe)                                                     | `components/Games`, `GamesList`                    | `00ff0fef` … `99a3e00f`            |
| Sticky navigation + redesigned footer + footer pages (contact/terms/disclaimer) | `components/StickyNav`, `Footer`, `pages/*Page`    | `03cc665b`, `dd922b89`, `44ff34d0` |
| Dark / light mode toggle                                                        | `components/ThemeToggle`, `contexts`               | `8a20801a`                         |
| Mobile-responsive layout                                                        | global CSS/Tailwind                                | `196278e3`                         |
| Newspaper-style print view                                                      | `components/NewspaperPrintView`, `print.css`       | `46c64f5c`, `cefc02ef`             |
| Tailwind migration for the client                                               | client build config                                | `c9c7a71f`, `da1a7f00`, `2ee8cde3` |
| Front-end performance work (CLS, image compression, lazy loading)               | `components/Image`, client config                  | `c391a418`, `9829b279`, `c271eab5` |
| Admin login + protected/guarded routes                                          | `pages/AdminLogin`, `AdminRoute`, `ProtectedRoute` | `ProtectedRoute.tsx`               |
| Dev/prod URL + debug-log separation                                             | client/admin config modules                        | `973a6d58`, `6e812d0a`             |

### 2.3 Admin panel (React, `admin/`)

| Feature                                                                                                          | Where it lives                              | Evidence               |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------- |
| Admin SPA with layout + navigation                                                                               | `admin/src/components/AdminLayout.tsx`      | PR #4                  |
| Password-gated admin API (`ADMIN_PASSWORD` env var, sent as a `?password=` query param; `debug` shortcut in dev) | `server/src/controllers/adminController.ts` | `validatePassword()`   |
| Dashboard                                                                                                        | `admin/src/pages/Dashboard.tsx`             | PR #4                  |
| Article list with pagination                                                                                     | `pages/` + `server` pagination              | `299fafc4`, `b8cc49df` |
| Article editor                                                                                                   | `admin/src/pages/ArticleEditor.tsx`         | `5c0ebaf1`             |
| One-click article generation buttons                                                                             | admin client                                | `c73bec4e`             |
| Site configuration / site constants page                                                                         | `admin/src/pages/SiteConfiguration.tsx`     | `9dd92ceb`             |
| Settings page                                                                                                    | `admin/src/pages/Settings.tsx`              | PR #4                  |

### 2.4 Data & storage

| Feature                                                                     | Evidence                                       |
| --------------------------------------------------------------------------- | ---------------------------------------------- |
| Database moved lowdb → SQLite (via a short MongoDB detour that was dropped) | `b972777f`, `69d65cf9`, `8375c07b`, `8264a6f9` |
| Article schema reworked for the new content types                           | `7dd53a12`                                     |
| Article fetching moved from the frontend to the backend                     | `7e88d873`                                     |
| Database directory relocated outside `server/src` + gitignored              | `8264a6f9`, `e18be4ae`                         |

### 2.5 DevOps, infrastructure & tooling

| Feature                                                                                       | Evidence                           |
| --------------------------------------------------------------------------------------------- | ---------------------------------- |
| Everything dockerized (client, server, admin) with dev + prod compose files and nginx configs | `9812a4b9`, `72620217`, `2ea6992b` |
| Production VPS deployment — see section 1, PR #1                                              | `8fe16cd0`                         |
| GitHub Actions CI pipeline (install → lint → typecheck → build → test)                        | `3526200f`, `51ee776d`, `0a8ae816` |
| Pre-commit hooks (husky + lint-staged + Prettier + ESLint) — PR #2/#3                         | `4f9bc64d`, `849e6847`             |
| Lint/format commands at the repo root                                                         | `fdf81d0e`                         |
| `trust proxy` so the API sees the real client IP/scheme behind nginx                          | `848a217e`                         |
| Docker startup ordering hardened (no more boot race)                                          | `e10f5e6e`                         |
| Central env/config documentation (`ENV_CONFIG.md`)                                            | PR #8                              |

### 2.6 Quality & documentation

| Feature                                                                                 | Evidence               |
| --------------------------------------------------------------------------------------- | ---------------------- |
| Vitest unit/integration + Playwright E2E suites, `TESTING.md`, `plans/testing-suite.md` | PR #7                  |
| Per-workspace ESLint configs (`client`, `server`, `admin`)                              | PR #2/#10              |
| Universal Prettier formatting baseline                                                  | `cb9520f8`, `7f0c583d` |
| `plans/` planning directory + plan template                                             | PR #6                  |

### 2.7 Half-wired or dead code that currently sits on `main`

Not features, but listed so nobody stumbles on them and assumes they work:

- **Google login** — `server/src/routes/auth.ts` is entirely commented out; no OAuth flow is functional.
- **Mongo-era admin model** — `server/src/models/admin.ts` (bcrypt-hashed admin document) is never imported; the real auth is the shared `ADMIN_PASSWORD`.
- **Horoscope job** — `server/src/jobs/horoscopeGeneration.ts` exists but nothing imports it.

## 3. Abandoned / never-merged branches (still on `origin`)

These have commits that exist **only** on the branch. If the branch is deleted, that code is gone
for good (until gc). Ranked by how much is actually in them.

| Branch                                  | Last commit | Not in `main`                  | What it was trying to do                                                                                                                                                                                                 | Verdict                                                                                                                                                                                              |
| --------------------------------------- | ----------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `feature/absolute-clock-cron-scheduler` | 2026-05-16  | 4 commits / ~2,044 added lines | Replace the fixed-interval scheduler with a DB-driven engine that runs jobs at absolute wall-clock times (DST-safe), plus an admin **Cron Jobs** page (`CronJobs.tsx`, 978 lines), cron REST API and a `cron_jobs` table | ⭐ **The only one worth reviving.** Design doc already merged into `main` as `plans/absolute-clock-cron-scheduler-rundown.md` (`0ccf9289`); the implementation never landed. 2 commits behind `main` |
| `fix/workspaces-ci-and-config-page`     | 2026-05-09  | 1 commit                       | npm workspaces fix + CI typecheck + admin `Config.tsx` page                                                                                                                                                              | Superseded: CI was fixed differently in PR #10, and `Config.tsx` became `SiteConfiguration.tsx` (`9dd92ceb`)                                                                                         |
| `editor_pipe_line`                      | 2026-01-30  | 3 commits                      | "Editor pipeline": editorial/style/source services, `contentNormalizer`, `editorAddition.md`, agent rule file                                                                                                            | Dead. None of its new files (`editorialService.ts`, `styleService.ts`, `.clinerules/basic_standards.md`, `docs/specifications/`) exist on `main`                                                     |
| `feature/horoscope-astrology`           | 2026-01-30  | 4 commits                      | Astrology spec on top of the editor pipeline                                                                                                                                                                             | Dead — the horoscope feature that _did_ ship came from `main` (`694659e5`)                                                                                                                           |
| `feature/music-charts`                  | 2026-01-31  | 5 commits                      | Music-charts spec on top of the editor pipeline                                                                                                                                                                          | Dead — spec only                                                                                                                                                                                     |
| `feature/comments-debates`              | 2026-01-30  | 4 commits                      | Comments + bot-debate spec                                                                                                                                                                                               | Dead — spec only                                                                                                                                                                                     |
| `feature/featured-articles-prediction`  | 2026-01-30  | 4 commits                      | Featured articles + prediction-markets spec                                                                                                                                                                              | Dead — spec only                                                                                                                                                                                     |
| `admin-panel`                           | 2025-11-15  | 4 commits                      | Original **Svelte** admin panel                                                                                                                                                                                          | Obsolete — replaced by the React rewrite (PR #4)                                                                                                                                                     |
| `twitter_pulling`                       | 2025-11-15  | 2 commits                      | Pulling posts from Twitter/X as a content source                                                                                                                                                                         | Dead prototype                                                                                                                                                                                       |

Note: the four `feature/*` spec branches and `editor_pipe_line` also commit `database/database.db`,
`server/src/scripts/insert_example_data.sql` and `server/scripts/fix_paragraph_formatting.sql` — a
SQLite binary should never be committed, so do not cherry-pick them blindly.

## 4. Practical takeaways

1. `main` is the single source of truth — it contains every merged branch's work.
2. The 11 branch deletions done during this cleanup (2026-11-06) removed labels only; all their
   commits are still in `main`'s history and all PR merge commits still name their source branch.
3. If the cron scheduler is ever wanted, restart from
   `feature/absolute-clock-cron-scheduler`: `git log --oneline origin/main..origin/feature/absolute-clock-cron-scheduler`.
4. The README "Possible additions" checklist still lists several genuinely unbuilt features
   (search, comments, pagination, RSS, share buttons, weather, tip jar, mid-article images). None of
   the branches above implement them, apart from the spec-only branches.
