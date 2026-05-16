/**
 * Absolute Clock Scheduler Engine
 *
 * Loads cron jobs from the SQLite database and schedules them using
 * absolute clock timing (firstRunAt + N * intervalSeconds >= now).
 * When a job fires, it sends an HTTP POST request to the job's route path
 * on the local server, ensuring every action goes through Express.
 */

import { getDatabase } from '../lib/database/database.js';
import { debugLog, debugWarn, debugError } from '../utils/debugLogger.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CronJobRow {
  id: number;
  name: string;
  route_path: string;
  first_run_at: string;
  interval_seconds: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

interface ActiveTimer {
  jobId: number;
  timer: ReturnType<typeof setTimeout>;
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const activeTimers = new Map<number, ActiveTimer>();
let isInitialized = false;

function getServerPort(): number {
  return process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function initializeCronScheduler(): void {
  if (isInitialized) {
    debugLog('Reloading cron scheduler...');
    clearAllTimers();
  }

  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM cron_jobs WHERE is_active = 1').all() as CronJobRow[];

  if (rows.length === 0) {
    debugLog('No active cron jobs to schedule');
    isInitialized = true;
    return;
  }

  for (const job of rows) {
    scheduleJob(job);
  }

  debugLog(`Cron scheduler initialized with ${rows.length} active job(s)`);
  isInitialized = true;
}

export function reloadJob(jobId: number): void {
  clearTimer(jobId);
  const db = getDatabase();
  const job = db.prepare('SELECT * FROM cron_jobs WHERE id = ?').get(jobId) as
    | CronJobRow
    | undefined;
  if (!job) {
    debugLog(`Job #${jobId} gone, timer cleared`);
    return;
  }
  if (!job.is_active) {
    debugLog(`Job #${jobId} ("${job.name}") inactive, not scheduling`);
    return;
  }
  scheduleJob(job);
}

export function removeJob(jobId: number): void {
  clearTimer(jobId);
  debugLog(`Removed timer for job #${jobId}`);
}

export function computeNextRun(job: {
  first_run_at: string;
  interval_seconds: number;
  is_active: number;
}): Date | null {
  if (!job.is_active) return null;
  const firstRunMs = new Date(job.first_run_at).getTime();
  if (isNaN(firstRunMs)) {
    debugWarn(`Invalid first_run_at for job: "${job.first_run_at}"`);
    return null;
  }
  const intervalMs = job.interval_seconds * 1000;
  if (intervalMs <= 0) return null;
  const now = Date.now();
  if (now < firstRunMs) return new Date(firstRunMs);
  const elapsed = now - firstRunMs;
  const periodsPast = Math.floor(elapsed / intervalMs);
  return new Date(firstRunMs + (periodsPast + 1) * intervalMs);
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function scheduleJob(job: CronJobRow): void {
  const nextRun = computeNextRun(job);
  if (!nextRun) return;
  const delayMs = nextRun.getTime() - Date.now();
  if (delayMs <= 0) return;

  const safeDelay = Math.min(delayMs, 7 * 24 * 60 * 60 * 1000);

  const timer = setTimeout(async () => {
    await executeJob(job);
    scheduleJob(job);
  }, safeDelay);

  activeTimers.set(job.id, { jobId: job.id, timer });
  debugLog(
    `Scheduled job #${job.id} ("${job.name}") next at ${nextRun.toISOString()} (${fmtDur(delayMs)})`,
  );
}

async function executeJob(job: CronJobRow): Promise<void> {
  const url = `http://localhost:${getServerPort()}${job.route_path}`;
  debugLog(`Executing job #${job.id} ("${job.name}") POST ${url}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      debugWarn(`Job #${job.id} ("${job.name}") HTTP ${response.status}: ${body.slice(0, 200)}`);
    } else {
      debugLog(`Job #${job.id} ("${job.name}") completed`);
    }
  } catch (err) {
    debugError(
      `Job #${job.id} ("${job.name}") threw: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

function clearTimer(jobId: number): void {
  const existing = activeTimers.get(jobId);
  if (existing) {
    clearTimeout(existing.timer);
    activeTimers.delete(jobId);
  }
}

function clearAllTimers(): void {
  for (const [, entry] of activeTimers) clearTimeout(entry.timer);
  activeTimers.clear();
}

function fmtDur(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h % 24 > 0) parts.push(`${h % 24}h`);
  if (m % 60 > 0) parts.push(`${m % 60}m`);
  if (s % 60 > 0 && parts.length === 0) parts.push(`${s % 60}s`);
  return parts.join(' ') || '0s';
}
