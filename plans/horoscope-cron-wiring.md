# Horoscope Generation — Wire the Daily Job Into the Scheduler

> **Status:** Planned · **Priority:** High · **Scope:** `server/src/jobs`, `server/src/app.ts`, `server/src/index.ts` · **Order:** commit 8 of the 2026-11-07 session (`plans/README.md`)

## Problem

- `server/src/jobs/horoscopeGeneration.ts` exports `generateDailyHoroscopes()` and
  `scheduleHoroscopeGeneration()`, but **nothing imports either one**. No environment
  generates horoscopes on a schedule: the table only ever fills from
  `scripts/generateMockData.ts` or from the read-time fake fallback in `fakeDataService`.
- `server/src/jobs/scheduler.ts` contains no horoscope entry, so `/api/horoscopes/*` is
  empty on a fresh production database and the UI shows placeholders.
- Two unrelated scheduling mechanisms coexist: `startRandomInterval()` (a `setTimeout`
  chain in `server/src/utils/general.ts`) drives news fetching / article writing /
  recipes, while `node-cron` drives the horoscope job that never runs. Neither knows
  about the other, and nothing central lists what is scheduled.
- `initializeScheduledJobs()` is called at **module scope** in `server/src/app.ts`
  (line 27), so any test that imports `app` starts real timers — and with keys present,
  real API calls.
- The enable flag has two sources of truth: `process.env.ENABLE_SCHEDULED_JOBS`
  (read in `scheduler.ts`) and the `site_config.enableScheduledJobs` row edited from the
  admin panel. The admin toggle only takes effect after a restart, and the env var
  silently wins.
- `saveHoroscopes()` already uses `INSERT OR REPLACE` against `UNIQUE(date, zodiacSign)`,
  so writes are idempotent — but a naive "run on boot" would regenerate all twelve signs
  (12 LLM calls) on every restart.

## Goal

One scheduler, one on/off switch, and horoscopes that are produced every day even when
the process was down at midnight.

## Design

Replace the scattered wiring with a declarative registry in `server/src/jobs/scheduler.ts`:

```ts
interface ScheduledJob {
  name: string; // 'news-fetch', 'article-writing', 'recipe-generation', 'featured', 'horoscopes'
  schedule:
    | { kind: 'cron'; expression: string }
    | { kind: 'random-interval'; minSec: number; maxSec: number };
  runOnBoot?: 'always' | 'if-due' | 'never';
  run: () => Promise<void> | void;
}
```

- One `startScheduler(jobs)` reads the enable flag **once** and registers everything,
  logging `registered|skipped <name>` so the boot log states exactly what is active.
- Job bodies stay where they are (`blogWriting.ts`, `newsFetching.ts`, `recipeGeneration.ts`,
  `featuredArticleSelection.ts`, `horoscopeGeneration.ts`) — only the wiring moves.
- Horoscopes become one more entry: cron `0 0 * * *`, `runOnBoot: 'if-due'`.
- `generateDailyHoroscopes()` gains a cheap guard: skip when today's rows already exist
  (`SELECT COUNT(*) FROM horoscopes WHERE date = ?`), so boots cost zero LLM calls.
- `node-cron` stays as the cron engine (`^3.0.3` is already a dependency and typed), used
  _inside_ `startScheduler` instead of inside the job module.

## Implementation

- [ ] Add the `ScheduledJob` type + `JOBS` array + `startScheduler()` in `server/src/jobs/scheduler.ts`
- [ ] Port the four existing jobs into registry entries without behaviour change
      (`addNewsToTotal(10)`, article writing every ~8h, recipes daily, featured selection)
- [ ] Add the horoscope entry (`cron '0 0 * * *'`, `runOnBoot: 'if-due'`)
- [ ] Add the `hasHoroscopesForDate()` guard in `server/src/services/horoscopeService.ts`
      and use it in `generateDailyHoroscopes()`
- [ ] Delete `scheduleHoroscopeGeneration()` (dead cron wiring) once the entry exists
- [ ] Move `initializeScheduledJobs()` out of `server/src/app.ts` module scope into
      `startServer()` in `server/src/index.ts`, after `initializeSchema()`/`getDatabase()`
- [ ] Resolve the enable flag once in `server/src/config/env.ts`
      (`isScheduledJobsEnabled()`); have `scheduler.ts` consume it and let the admin
      toggle write `site_config` only (documented as "takes effect on restart")
- [ ] Replace `startRandomInterval`'s fire-and-forget `setTimeout` chain in the registry
      with a single helper that returns a stop handle (needed for tests and shutdown)
- [ ] Unit tests (`server/src/jobs/__tests__/scheduler.test.ts`) with `vi.useFakeTimers()`:
      disabled → zero registrations; enabled → five; `run` mocked, no network

## DevOps Impact

- No new environment variables. `ENABLE_SCHEDULED_JOBS` keeps governing everything.
- Cost: horoscopes add ~12 LLM calls per day (one per zodiac sign) plus one
  FreeAstroAPI request (no key needed; `astrologyService.ts` has an offline fallback).
- The dev overlay keeps `ENABLE_SCHEDULED_JOBS=false`, so dev never pays for this — see
  `plans/dev-content-seeding.md` for how dev gets horoscope rows instead.

## Testing

- Unit: registration matrix (enabled/disabled), `if-due` guard (rows present → no call,
  rows missing → one call), and no timer leaks between tests.
- Manual: `ENABLE_SCHEDULED_JOBS=true` against a scratch database,
  `docker compose logs -f server` shows `registered horoscopes`, and
  `GET /api/horoscopes/today` returns twelve rows.

## Edge Cases

- **Timezone:** containers run UTC, so "today" is the UTC date. If editorial "today"
  matters, pin `TZ` in compose rather than hard-coding offsets.
- **LLM failure:** `generateHoroscopeForSign()` already falls back to a canned paragraph;
  keep that, but log a warning so a day of fallbacks is visible.
- **Astrology API failure:** `createFallbackAstrologicalData()` covers it; rows still get
  written.
- **Restart storm:** the `if-due` guard is the only thing preventing 12 calls per restart.
- **Missing API keys:** without `DEEPSEEK_API_KEY` the job must degrade to fallback text,
  never crash the scheduler.

## Alternatives Considered

- **Keep only `node-cron` and drop `startRandomInterval`:** cleaner, but the random spread
  exists to keep generation looking organic — keep it as a schedule kind instead.
- **Call `scheduleHoroscopeGeneration()` from `scheduler.ts` as-is:** smallest diff, but it
  keeps two mechanisms, keeps the immediate-run cost on every boot, and leaves the job
  invisible in the registry and boot logs.
- **Generate horoscopes on first request instead of by cron:** moves LLM latency into a
  user-facing request path; rejected.
