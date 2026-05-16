# Absolute-Clock Cron Job Scheduler — Implementation Rundown

## Goal

Replace the old randomized-interval scheduler (`startRandomInterval` based on setTimeout relative to deployment start) with an absolute-clock-based system where cron jobs run at fixed calendar times (e.g., "every day at 12:00 PM") regardless of when the server was deployed. Provide an admin panel page to manage cron jobs (CRUD, toggle, schedule configuration).

## Architecture Overview

```
Admin Panel (React) /cron-jobs page
  |  API calls with ?password=
  v
Server (Express) /api/admin/cron-jobs (CRUD controller)
  |
  v
cron_jobs table (SQLite) -- stores job config
  |
  v
jobSchedulerEngine.ts -- setTimeout chains based on
absolute clock formula: firstRunAt + N * interval >= now
  |
  v
Internal HTTP POST to http://localhost:PORT/route_path
(password=__internal_cron__ bypasses auth)
```

## Files to Create

### 1. server/src/jobs/jobSchedulerEngine.ts

Core scheduler engine. Non-exported state:
- `activeTimers: Map<number, ScheduledTimer>` -- in-memory map of active setTimeout handles
- `serverPort: number = 5001` -- default, overridden by setServerPort()

Exported functions:

- `setServerPort(port: number)` -- called at server startup after listen()
- `initializeJobScheduler()` -- loads all is_active=1 jobs from cron_jobs table, calls scheduleJob() for each
- `rescheduleJob(jobId: number, isDeleted?: boolean)` -- clear existing timer; if not deleted, reload from DB and reschedule
- `shutdownScheduler()` -- clearTimeout for all entries in activeTimers map

Internal functions:

- `computeNextRunMs(firstRunAt: string, intervalSeconds: number): number | null`
  - Parses firstRunAt as Date, converts to epoch ms
  - `intervalMs = intervalSeconds * 1000`
  - `elapsed = Date.now() - firstRunMs`
  - If elapsed <= 0, return firstRunMs (hasn't happened yet)
  - `n = Math.ceil(elapsed / intervalMs)`
  - `return firstRunMs + n * intervalMs`
  - Returns null if firstRunAt is invalid or intervalSeconds <= 0

- `executeCronJob(job: CronJobRow)`
  - `fetch(http://localhost:{serverPort}{job.route_path}?password=__internal_cron__, { method: 'POST', signal: AbortSignal.timeout(300000) })`
  - Logs success (200) or warning (non-200) or error (timeout, connection refused)
  - Timeout is 5 minutes

- `scheduleJob(job: CronJobRow)`
  - Clear existing timer for job.id if present
  - If !job.is_active -> log and return
  - Compute nextRunMs; if null -> warn and return
  - `delayMs = nextRunMs - Date.now()`
  - If delayMs <= 0 (should run now):
    1. executeCronJob(job)
    2. Schedule next run after intervalSeconds (no delay)
    3. Save timer handle
  - Else:
    1. setTimeout with delayMs
    2. On fire: clear timer, executeCronJob(job), loadAndScheduleJob(job.id)
    3. Save timer handle
  - Log: `"Job X next run in Nm Ns (ISO timestamp)"`

- `loadAndScheduleJob(jobId: number)`
  - SELECT * FROM cron_jobs WHERE id = ?
  - If found, call scheduleJob(job)

### 2. server/src/jobs/cronJobSeeder.ts

- Check if cron_jobs table has any rows: `SELECT COUNT(*) as cnt FROM cron_jobs`
- If cnt > 0, return immediately (already seeded)
- Insert 4 default jobs with INSERT OR IGNORE:

| Name | Route Path | First Run (UTC) | Interval Seconds |
|---|---|---|---|
| Article Generation | /api/admin/generate/article | 1970-01-01T12:00:00.000Z | 28800 (8 hours) |
| News Fetching | /api/admin/generate/fetch-news | 1970-01-01T06:00:00.000Z | 7200 (2 hours) |
| Recipe Generation | /api/admin/generate/recipe | 1970-01-01T00:00:00.000Z | 86400 (24 hours) |
| Featured Article Selection | /api/admin/articles/featured | 1970-01-01T00:00:00.000Z | 86400 (24 hours) |

- Export `initializeScheduledJobs()` which calls seedDefaultCronJobs() then initializeJobScheduler()

### 3. server/src/controllers/cronJobController.ts

Duplicate validatePassword() same as adminController.ts with __internal_cron__ bypass.

4 exported handlers:

- `getCronJobs(GET)`:
  - SELECT * FROM cron_jobs ORDER BY id ASC
  - For each row, compute nextRunAt
  - Map SQL snake_case to camelCase for JSON response
  - Response: `{ success: true, jobs: [{ id, name, routePath, firstRunAt, intervalSeconds, isActive, createdAt, nextRunAt }] }`

- `createCronJob(POST)`:
  - Body: `{ name, routePath, firstRunAt?, intervalSeconds, isActive? }`
  - Validate: name required, routePath required, intervalSeconds >= 1
  - Default firstRunAt: `1970-01-01T00:00:00.000Z`
  - Default isActive: 1
  - INSERT INTO cron_jobs
  - Call `rescheduleJob(newJob.id)` to activate it in the scheduler engine
  - Return 201 with the created job object

- `updateCronJob(PUT /:id)`:
  - Parse numeric id from params
  - Check existing exists (404 if not)
  - Accept partial body: `{ name?, routePath?, firstRunAt?, intervalSeconds?, isActive? }`
  - Only update provided fields, keep existing values for omitted ones
  - UPDATE cron_jobs SET ...
  - Call `rescheduleJob(updated.id)` to re-evaluate in scheduler
  - Return the updated job

- `deleteCronJob(DELETE /:id)`:
  - Parse numeric id, check exists (404 if not)
  - DELETE FROM cron_jobs WHERE id = ?
  - Call `rescheduleJob(id, true)` with isDeleted=true to clear timer without reloading
  - Return `{ success: true, message: "Cron job deleted successfully" }`

- Must handle UNIQUE constraint violation on name (409 Conflict)

### 4. admin/src/pages/CronJobs.tsx

A full React component with hooks-based state management. Structure:

**State variables:**
- `jobs: CronJob[]` -- loaded from API
- `newJobs: typeof EMPTY_JOB[]` -- array of new job forms (not yet saved)
- `loading: boolean` -- spinner state
- `saving: number | null` -- job ID currently being saved (or -index-1 for new jobs)
- `error: string` -- error banner text
- `deleteTarget: CronJob | null` -- job pending deletion (triggers modal)

**Helper functions:**
- `formatInterval(seconds: number): string` -- e.g. 86400 -> "1d 0h 0m 0s"
- `toLocalDatetimeString(iso: string): string` -- e.g. ISO string -> "2026-05-16T12:00" (for datetime-local input)
- `EMPTY_JOB` constant -- `{ name: '', routePath: '', firstRunAt: '1970-01-01T00:00', intervalSeconds: 86400, isActive: true }`

**Handler functions:**
- `loadJobs()` -- fetchCronJobs(), sets loading/error state
- `handleSave(job)` -- updateCronJob(job.id, job fields), then reload
- `handleToggle(job)` -- updateCronJob(job.id, { isActive: !job.isActive }), then reload
- `updateField(id, field, value)` -- updates local state for inline editing without saving
- `addNewJob()` -- push EMPTY_JOB to newJobs array
- `removeNewJob(index)` -- filter out from newJobs array
- `updateNewJob(index, field, value)` -- update specific new job form field
- `handleCreate(index)` -- createCronJob(newJobs[index]), remove from newJobs on success, reload
- `handleDelete(job)` -- deleteCronJob(job.id), close modal, reload

**Render structure (top to bottom):**

1. **Access Denied guard:** If no `?pwd=` param, show unauthorized message

2. **Page header:** h1 "⏰ Cron Jobs" + subtitle "Schedule recurring server tasks on an absolute calendar clock"

3. **Error banner:** conditional `className="error-banner"`

4. **Info banner:** div explaining absolute scheduling (First Run date/time + interval, default Unix epoch start, POST request)

5. **Loading state:** spinner + "Loading cron jobs..." (only when no jobs loaded yet)

6. **Job cards list:** For each job in `jobs` array:
   - Card container: `background: var(--color-surface)`, `border: 1px solid var(--color-border)`, `border-radius: var(--radius-lg)`, `padding: var(--space-lg)`
   - **Card header (top-right):** Toggle switch (custom CSS toggle) + "Enabled"/"Disabled" label (green/gray)
   - **Fields row (flex wrap, align-items: flex-end):**
     - `form-group` Job Name (text input, flex: 1.5)
     - `form-group` Route Path (text input with `font-family: var(--font-mono)`, flex: 2, label shows "(POST)" in muted text)
     - `form-group` First Run (datetime-local input, flex: 1)
     - `form-group` Interval (seconds) (number input, min=1, flex: 0.8, title attribute shows formatInterval())
     - `form-group` Next Run (div with date, flex: 1, title attribute shows countdown e.g. "⏳ 3h 24m 0s")
     - Action buttons: `btn btn-primary btn-sm` "💾 Save", `btn btn-danger btn-sm` "🗑️"

7. **New job forms:** For each entry in `newJobs` array:
   - Yellow background (`#fefce8`), dashed orange border (`1.5px dashed #f59e0b`), label "✨ New Cron Job"
   - Same field layout as existing jobs but no "Next Run" display
   - Action buttons: `btn btn-success btn-sm` "✅ Create", `btn btn-ghost btn-sm" "✕ Cancel"

8. **Add button:** `btn btn-ghost` with dashed border, full width, "+ Add New Cron Job"

9. **Delete confirmation modal:** When `deleteTarget` is not null:
   - Fixed overlay: `position: fixed`, black semi-transparent background
   - Centered box: `var(--color-surface)` background, rounded corners
   - Title: "🗑️ Delete Cron Job"
   - Text: "Are you sure you want to delete the "**{jobName}**" cron job? This action cannot be undone."
   - Two buttons: `btn btn-ghost` "Cancel", `btn btn-danger` "Delete"
   - Clicking overlay background closes modal

### 5. admin/src/api/adminApi.ts additions

Add after the uploadImage function, before VALID_CATEGORIES:

```typescript
// --- Cron Job API ---

export interface CronJob {
  id: number;
  name: string;
  routePath: string;
  firstRunAt: string;
  intervalSeconds: number;
  isActive: boolean;
  createdAt: string;
  nextRunAt: string | null;
}

export interface FetchCronJobsResult {
  jobs?: CronJob[];
  error?: string;
}

export async function fetchCronJobs(): Promise<FetchCronJobsResult>
export async function createCronJob(job: { name, routePath, firstRunAt?, intervalSeconds, isActive? }): Promise<string | null>
export async function updateCronJob(id: number, updates: Partial<{ name, routePath, firstRunAt, intervalSeconds, isActive }>): Promise<string | null>
export async function deleteCronJob(id: number): Promise<string | null>
```

All use the existing `apiFetch<T>()` helper which prepends the API base URL and appends `?password=...`.

## Files to Modify

### 6. server/src/lib/database/schema.ts

At the end of `export function initializeSchema()`, before `debugLog(...)`:

```sql
CREATE TABLE IF NOT EXISTS cron_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    route_path TEXT NOT NULL,
    first_run_at TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z',
    interval_seconds INTEGER NOT NULL DEFAULT 86400,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### 7. server/src/routes/adminRoutes.ts

Add to imports:
```typescript
import { getCronJobs, createCronJob, updateCronJob, deleteCronJob } from '../controllers/cronJobController.js';
```

Add before `export default router`:
```typescript
router.get('/cron-jobs', getCronJobs);
router.post('/cron-jobs', createCronJob);
router.put('/cron-jobs/:id', updateCronJob);
router.delete('/cron-jobs/:id', deleteCronJob);
```

### 8. server/src/controllers/adminController.ts

In `validatePassword()`, add this BEFORE the `isDevelopment` check:
```typescript
if (password === '__internal_cron__') { return true; }
```

This exact same check must also be added to `cronJobController.ts`'s validatePassword().

### 9. server/src/index.ts

Add imports at the top:
```typescript
import { initializeScheduledJobs } from './jobs/cronJobSeeder.js';
import { setServerPort, shutdownScheduler } from './jobs/jobSchedulerEngine.js';
```

Inside the `listen()` callback, AFTER the console.log lines:
```typescript
setServerPort(Number(PORT));
initializeScheduledJobs();
```

Inside the `shutdown()` function, BEFORE `server.close()`:
```typescript
shutdownScheduler();
```

### 10. server/src/app.ts

Remove these two lines:
```typescript
import { initializeScheduledJobs } from './jobs/scheduler.js';
initializeScheduledJobs();
```

### 11. docker-compose.yml

Remove the line: `- ENABLE_SCHEDULED_JOBS=true` from server environment.

### 12. docker-compose.dev.yml

Remove the line: `- ENABLE_SCHEDULED_JOBS=false` from server environment.

### 13. admin/src/App.tsx

Add import:
```typescript
import CronJobs from './pages/CronJobs';
```

Add route inside the <Route element={<AdminLayout />}> block:
```typescript
<Route path="/cron-jobs" element={<CronJobs />} />
```

### 14. admin/src/components/AdminLayout.tsx

Add to NAV_ITEMS array (between Configuration and Settings):
```typescript
{ path: '/cron-jobs', label: 'Cron Jobs', icon: '⏰' },
```

## Files to Delete

### 15. server/src/jobs/scheduler.ts

The old scheduler file that used `startRandomInterval()` and imported `generateScheduledArticles`, `addNewsToTotal`, `generateScheduledRecipes`, `scheduleFeaturedArticleSelection`.

## ENABLE_SCHEDULED_JOBS Removal

This env var is no longer needed. Remove from:
- server/.env
- docker-compose.yml
- docker-compose.dev.yml
- jobSchedulerEngine.ts (remove the check at the start of initializeJobScheduler)

The scheduler now runs based purely on cron_jobs.is_active column. If no active jobs exist, the scheduler initializes but schedules nothing.

## Scheduler Lifecycle

```
Server starts
  -> initializeSchema() creates cron_jobs table (if missing)
  -> app.listen(PORT, () => {
      -> setServerPort(PORT)
      -> cronJobSeeder.initializeScheduledJobs()
          -> seedDefaultCronJobs() (inserts 4 defaults if table was empty)
          -> initializeJobScheduler()
              -> SELECT * FROM cron_jobs WHERE is_active = 1
              -> for each: scheduleJob() -> computeNextRunMs() -> setTimeout()
    })

Admin creates/updates/deletes a cron job via API
  -> cronJobController calls rescheduleJob(jobId, isDeleted?)
  -> Engine clears existing setTimeout for that job
  -> If not deleted: reloads job from DB, recomputes next run, sets new setTimeout

Cron job timer fires
  -> Scheduler logs the event
  -> executeCronJob(job) -> POST to route_path internally
  -> loadAndScheduleJob(job.id) -> reload job from DB, schedule next occurrence
     (This ensures any config changes made while the timer was pending take effect)

Server shutdown (SIGTERM/SIGINT)
  -> shutdownScheduler() -> clearTimeout for all active timers
  -> closeDatabase()
  -> process.exit(0)
```

## Testing

1. Start server: `cd server && npm run dev`
2. Verify: `curl "http://localhost:5001/api/admin/cron-jobs?password=changeme123"` returns 4 jobs with computed nextRunAt
3. Test toggle: `curl -X PUT "http://localhost:5001/api/admin/cron-jobs/2?password=changeme123" -H "Content-Type: application/json" -d '{"isActive":false}'`
4. Test create: `curl -X POST "http://localhost:5001/api/admin/cron-jobs?password=changeme123" -H "Content-Type: application/json" -d '{"name":"Test","routePath":"/api/health","intervalSeconds":60}'`
5. Test delete: `curl -X DELETE "http://localhost:5001/api/admin/cron-jobs/5?password=changeme123"`
6. Start admin panel: `cd admin && VITE_BACKEND_DEV_MODE=true npm run dev`
7. Open `http://localhost:5174/?pwd=changeme123` and navigate to Cron Jobs in sidebar
8. Verify computed nextRunAt (e.g., Article Generation firstRunAt 12:00:00Z + 28800s = next 12:00 UTC)

## Potential Pitfalls

1. **Time zones:** firstRunAt stored as ISO 8601 UTC. Admin panel datetime-local shows local time, toISOString() converts back. computeNextRunMs works in epoch ms -- timezone irrelevant.

2. **Past firstRunAt:** If firstRunAt is 1970-01-01 (Unix epoch), formula computes N iterations ahead until >= now. Correctly schedules next occurrence.

3. **__internal_cron__ auth:** Must be added to BOTH adminController.ts AND cronJobController.ts validatePassword(). Missing either breaks scheduler calls to that controller's endpoints.

4. **Server port:** setServerPort() must be called before initializeJobScheduler() inside the listen() callback, NOT before.

5. **scheduler.ts deletion:** The old file imports generateScheduledArticles, addNewsToTotal, etc. Make sure those functions are still importable elsewhere (they are -- they're used from routes too).
