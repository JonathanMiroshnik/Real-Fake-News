import { getDatabase } from '../lib/database/database.js';
import { debugLog } from '../utils/debugLogger.js';
import { initializeJobScheduler } from './jobSchedulerEngine.js';

/**
 * Seeds the cron_jobs table with default jobs if it's empty.
 * This runs once on first deployment to populate the legacy jobs.
 * Called once at server startup before handing off to jobSchedulerEngine.
 */
function seedDefaultCronJobs(): void {
  const db = getDatabase();
  const count = db.prepare('SELECT COUNT(*) as cnt FROM cron_jobs').get() as { cnt: number };

  if (count.cnt > 0) {
    return; // Already seeded
  }

  debugLog('🌱 [Scheduler] Seeding default cron jobs');

  const insert = db.prepare(`
    INSERT OR IGNORE INTO cron_jobs (name, route_path, first_run_at, interval_seconds, is_active)
    VALUES (?, ?, ?, ?, ?)
  `);

  const defaults = [
    ['Article Generation', '/api/admin/generate/article', '1970-01-01T12:00:00.000Z', 28800, 1],
    ['News Fetching', '/api/admin/generate/fetch-news', '1970-01-01T06:00:00.000Z', 7200, 1],
    ['Recipe Generation', '/api/admin/generate/recipe', '1970-01-01T00:00:00.000Z', 86400, 1],
    ['Featured Article Selection', '/api/admin/articles/featured', '1970-01-01T00:00:00.000Z', 86400, 1],
  ];

  for (const job of defaults) {
    insert.run(...job);
  }

  debugLog('🌱 [Scheduler] Seeded 4 default cron jobs');
}

// Scheduler of recurring jobs in the backend.
// Now uses the absolute-clock-based job scheduler engine.

// Used to start the recurring back-end jobs
export function initializeScheduledJobs() {
  seedDefaultCronJobs();
  initializeJobScheduler();
}
