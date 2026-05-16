import { getDatabase } from '../lib/database/database.js';
import { debugLog, debugWarn } from '../utils/debugLogger.js';

interface CronJobRow {
  id: number;
  name: string;
  route_path: string;
  first_run_at: string;
  interval_seconds: number;
  is_active: number;
  created_at: string;
}

interface ScheduledTimer {
  jobId: number;
  timer: ReturnType<typeof setTimeout>;
}

const activeTimers: Map<number, ScheduledTimer> = new Map();
let serverPort: number = 5001;

export function setServerPort(port: number): void {
  serverPort = port;
}

function computeNextRunMs(firstRunAt: string, intervalSeconds: number): number | null {
  const firstRun = new Date(firstRunAt).getTime();
  const now = Date.now();
  if (isNaN(firstRun)) return null;
  const intervalMs = intervalSeconds * 1000;
  if (intervalMs <= 0) return null;
  const elapsed = now - firstRun;
  if (elapsed <= 0) return firstRun;
  const n = Math.ceil(elapsed / intervalMs);
  return firstRun + n * intervalMs;
}

async function executeCronJob(job: CronJobRow): Promise<void> {
  const baseUrl = `http://localhost:${serverPort}`;
  const url = `${baseUrl}${job.route_path}?password=__internal_cron__`;

  debugLog(`⏰ [Scheduler] Running cron job "${job.name}" -> POST ${job.route_path}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(300000),
    });

    if (!response.ok) {
      debugWarn(`⚠️ [Scheduler] Job "${job.name}" returned HTTP ${response.status}`);
    } else {
      debugLog(`✅ [Scheduler] Job "${job.name}" completed successfully`);
    }
  } catch (error: any) {
    if (error?.name === 'TimeoutError') {
      debugWarn(`⚠️ [Scheduler] Job "${job.name}" timed out after 5 minutes`);
    } else if (error?.code === 'ECONNREFUSED') {
      debugWarn(`⚠️ [Scheduler] Server not reachable for job "${job.name}"`);
    } else {
      console.error(`❌ [Scheduler] Error executing job "${job.name}":`, error);
    }
  }
}

function scheduleJob(job: CronJobRow): void {
  const existing = activeTimers.get(job.id);
  if (existing) {
    clearTimeout(existing.timer);
    activeTimers.delete(job.id);
  }

  if (!job.is_active) {
    debugLog(`⏸️ [Scheduler] Job "${job.name}" is disabled, skipping schedule`);
    return;
  }

  const nextRunMs = computeNextRunMs(job.first_run_at, job.interval_seconds);
  if (nextRunMs === null) {
    debugWarn(`⚠️ [Scheduler] Cannot compute next run for job "${job.name}"`);
    return;
  }

  const delayMs = nextRunMs - Date.now();
  if (delayMs <= 0) {
    debugLog(`⏰ [Scheduler] Job "${job.name}" should run now, scheduling immediate run`);
    executeCronJob(job);
    const nextDelay = job.interval_seconds * 1000;
    const timer = setTimeout(() => {
      activeTimers.delete(job.id);
      executeCronJob(job);
      loadAndScheduleJob(job.id);
    }, nextDelay);
    activeTimers.set(job.id, { jobId: job.id, timer });
    return;
  }

  const minutes = Math.floor(delayMs / 60000);
  const seconds = Math.floor((delayMs % 60000) / 1000);
  debugLog(
    `⏰ [Scheduler] Job "${job.name}" next run in ${minutes}m ${seconds}s (${new Date(nextRunMs).toISOString()})`,
  );

  const timer = setTimeout(() => {
    activeTimers.delete(job.id);
    executeCronJob(job);
    loadAndScheduleJob(job.id);
  }, delayMs);

  activeTimers.set(job.id, { jobId: job.id, timer });
}

function loadAndScheduleJob(jobId: number): void {
  try {
    const db = getDatabase();
    const job = db.prepare('SELECT * FROM cron_jobs WHERE id = ?').get(jobId) as CronJobRow | undefined;
    if (job) {
      scheduleJob(job);
    }
  } catch (error) {
    console.error(`[Scheduler] Error loading job ${jobId}:`, error);
  }
}

export function rescheduleJob(jobId: number, isDeleted: boolean = false): void {
  const existing = activeTimers.get(jobId);
  if (existing) {
    clearTimeout(existing.timer);
    activeTimers.delete(jobId);
  }
  if (!isDeleted) {
    loadAndScheduleJob(jobId);
  }
}

export function initializeJobScheduler(): void {
  try {
    const db = getDatabase();
    const jobs = db.prepare('SELECT * FROM cron_jobs WHERE is_active = 1 ORDER BY id ASC').all() as CronJobRow[];

    if (jobs.length === 0) {
      debugLog('⏰ [Scheduler] No cron jobs found in database');
      return;
    }

    debugLog(`⏰ [Scheduler] Initializing ${jobs.length} cron job(s)`);

    for (const job of jobs) {
      scheduleJob(job);
    }
  } catch (error) {
    console.error('❌ [Scheduler] Error initializing cron jobs:', error);
  }
}

export function shutdownScheduler(): void {
  debugLog('⏰ [Scheduler] Shutting down, clearing all timers...');
  for (const [jobId, scheduled] of activeTimers) {
    clearTimeout(scheduled.timer);
  }
  activeTimers.clear();
}