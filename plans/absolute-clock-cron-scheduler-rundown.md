# Absolute Clock Cron Scheduler Rundown

> **Status:** Completed
> **Priority:** High
> **Branch:** `feature/absolute-clock-cron-scheduler`
> **Ticket Goal:** Replace `startRandomInterval` with a deterministic, auditable cron-driven scheduler using absolute clock timing.

---

## Problem

The current scheduler in `server/src/jobs/scheduler.ts` relied on `startRandomInterval` — a `setTimeout`-based utility that runs jobs at **random intervals**. This caused several issues:

- **Non-deterministic timing** — You could not predict when articles, recipes, or news-fetching would run
- **No visibility** — There was no central registry of scheduled jobs; each job was scattered across files
- **No audit trail** — If a job failed or was skipped, there was no log of what was supposed to run and when
- **Hard to debug** — Reproducing timing issues required waiting for random intervals
- **No grace / retry logic** — A failed job was silently skipped until the next random interval
- **No management API** — Operators could not list, trigger, pause, or resume jobs at runtime

Additionally, two jobs (`scheduleFeaturedArticleSelection`, `scheduleHoroscopeGeneration`) used `node-cron` directly, creating a **split personality** — some jobs were cron-based, some were timer-based — with no unified abstraction.

---

## Goal

1. Create a single **"Absolute Clock"** engine that owns all scheduled jobs, stored in a SQLite table
2. Convert all random-interval jobs to **deterministic cron schedules**
3. Provide **observability** — next-run time, run count, error count per job
4. Support **create/update/delete/toggle** of cron jobs via the admin panel
5. Expose a **CRUD management API** to manage jobs at runtime

---

## Architecture

### Job Lifecycle

```
+---------------------------------------------------------------+
|                    Absolute Clock Scheduler                    |
|                                                               |
|  +--------------+    +-------------------+    +------------+  |
|  |  cron_jobs   |--->|  setTimeout Chain  |--->|  POST to  |  |
|  |  (SQLite DB) |    |  (absolute clock)  |    |  route    |  |
|  +--------------+    +-------------------+    +------------+  |
|         |                                                     |
|         v                                                     |
|  +----------------------------------------------------+      |
|  |  CRUD API  (GET/POST/PUT/DELETE /admin/cron-jobs)   |      |
|  +----------------------------------------------------+      |
+---------------------------------------------------------------+
```

### Key Design Decision: HTTP Self-Calls

When a cron job fires, the server sends an HTTP `POST` request to itself at the job's `route_path`. This ensures:

- All actions go through Express middleware (logging, auth, rate limiting)
- Consistency — cron-triggered actions are identical to user-triggered ones
- Future-proofing — cron jobs can call any endpoint, new ones don't need code changes

### Absolute Clock Formula

```
nextRun = firstRun + N x intervalSeconds
where N = ceil((now - firstRun) / intervalSeconds)
```

This means the schedule is anchor-based, not deployment-relative. A job with `firstRun = 1970-01-01 12:00` and `interval = 28800s (8h)` will always fire at 12:00, 20:00, 04:00 regardless of when the server was started.

---

## Files Created

| File | Purpose |
|---|---|
| `server/src/jobs/jobSchedulerEngine.ts` | Absolute clock engine — loads from DB, fires setTimeout chains, self-HTTP execution |
| `server/src/controllers/cronJobController.ts` | CRUD controller for cron jobs (password-protected) |
| `admin/src/pages/CronJobs.tsx` | Admin UI page: toggle, inline edit, save/delete per row, add new |

## Files Modified

| File | Change |
|---|---|
| `server/src/lib/database/schema.ts` | Added `cron_jobs` table + seed 4 defaults |
| `server/src/app.ts` | Calls `initializeCronScheduler()` after DB init |
| `server/src/routes/adminRoutes.ts` | Added 4 cron job CRUD routes |
| `admin/src/api/adminApi.ts` | Added `CronJobData` types + API functions |
| `admin/src/App.tsx` | Added `/cron` route |
| `admin/src/components/AdminLayout.tsx` | Added "Scheduled Jobs" nav item |
| `README.md` | Added Docker kill chain and compose troubleshooting |

---

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS cron_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    route_path TEXT NOT NULL,
    first_run_at TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z',
    interval_seconds INTEGER NOT NULL DEFAULT 3600,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Seeded Defaults

| Name | Route | First Run | Interval |
|---|---|---|---|
| Article Generation | /api/admin/generate/article | 1970-01-01 12:00 | 28800s (8h) |
| News Fetching | /api/admin/generate/fetch-news | 1970-01-01 06:00 | 7200s (2h) |
| Recipe Generation | /api/admin/generate/recipe | 1970-01-01 03:00 | 86400s (24h) |
| Featured Article Selection | /api/admin/articles/select-featured | 1970-01-01 00:00 | 86400s (24h) |

---

## API Endpoints

All under `/api/admin/` with `?password=` query param:

| Method | Endpoint | Description |
|---|---|---|
| GET | /cron-jobs | List all cron jobs with computed `next_run_at` |
| POST | /cron-jobs | Create a new cron job |
| PUT | /cron-jobs/:id | Update a cron job (re-schedules on save) |
| DELETE | /cron-jobs/:id | Delete a cron job (removes timer) |

---

## Admin Page Features

| Feature | Detail |
|---|---|
| Enable/Disable toggle | Per-card toggle switch, updates `is_active` immediately |
| Job Name | Editable text input |
| Route Path | Editable text input with monospace font |
| First Run | `datetime-local` picker |
| Interval | Number input in seconds; hover tooltip shows min/hr/day |
| Next Run | Computed date; hover shows countdown |
| Save | Per-row save button, sends PUT |
| Delete | Opens confirmation modal with job name |
| Add New | `+ Add New Cron Job` button opens inline form |

---

## Testing Strategy

| # | Test | Type |
|---|---|---|
| 1 | `computeNextRun` with valid data returns correct future date | Unit |
| 2 | `computeNextRun` with invalid date returns `null` | Unit |
| 3 | `computeNextRun` with zero interval returns `null` | Unit |
| 4 | `computeNextRun` with inactive job returns `null` | Unit |
| 5 | Register duplicate job name returns error | Integration |
| 6 | Update cron job re-schedules correctly | Integration |
| 7 | Delete cron job removes timer | Integration |
| 8 | Toggle pause/resume works | Integration |

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| Invalid `first_run_at` date string | `computeNextRun` returns `null`, warning logged |
| Zero or negative interval | `computeNextRun` returns `null` |
| Job timer fires before server is listening | `setTimeout` callback runs on next event loop tick — Express is already listening |
| Self-HTTP request fails (connection refused) | Error logged, job re-schedules next run |
| Duplicate job name on create | API returns `409 Conflict` |
| Job not found on update/delete | API returns `404 Not Found` |

---

## Alternative Approaches Considered

### 1. Bull / BullMQ (Rejected)
Redis-backed job queue. Overkill for a single-process Node app. Adds Redis dependency.

### 2. agenda.js (Rejected)
MongoDB-backed scheduler. External DB dependency for what SQLite handles natively.

### 3. Keep `startRandomInterval` (Rejected)
Randomness adds zero value for content generation. Makes debugging impossible.

---

## Future Work

- **Phase 2:** Persist job state (last-run timestamps, error counts) back to DB
- **Phase 3:** Admin UI improvements — job history, execution logs
- **Phase 4:** Alert webhooks when a job fails repeatedly
