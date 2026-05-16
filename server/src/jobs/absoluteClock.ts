/**
 * Absolute Clock — deterministic cron-driven scheduler.
 *
 * Provides a central registry for all recurring jobs, wraps node-cron,
 * and exposes a management API for runtime observability and control.
 */

import cron from 'node-cron';
import { debugLog, debugWarn } from '../utils/debugLogger.js';
import type { JobDefinition, JobInfo, JobState } from './absoluteClockTypes.js';

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const registry = new Map<string, JobDefinition>();
const cronTasks = new Map<string, cron.ScheduledTask>();

function createInitialState(): JobState {
  return {
    lastRun: null,
    lastResult: null,
    lastError: null,
    runCount: 0,
    errorCount: 0,
  };
}

// ---------------------------------------------------------------------------
// Execution helpers
// ---------------------------------------------------------------------------

/**
 * Wraps a promise with a timeout. If the promise does not settle within
 * `ms` milliseconds, the returned promise rejects with a TimeoutError.
 */
function runWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Job timed out after ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer!));
}

/**
 * Executes a job's handler with retry logic and timeout protection.
 * Mutates the job's state object on success / failure.
 */
async function executeWithRetry(def: JobDefinition): Promise<void> {
  for (let attempt = 0; attempt <= def.maxRetries; attempt++) {
    try {
      await runWithTimeout(def.handler(), def.timeoutMs);
      def.state.lastResult = 'success';
      def.state.lastError = null;
      def.state.runCount++;
      def.state.lastRun = new Date();

      if (attempt > 0) {
        debugLog(`🔄 Job "${def.name}" succeeded on retry ${attempt + 1}`);
      }
      return;
    } catch (err) {
      def.state.errorCount++;
      const message = err instanceof Error ? err.message : String(err);
      def.state.lastError = message;

      if (attempt < def.maxRetries) {
        debugWarn(
          `⚠️ Job "${def.name}" failed (attempt ${attempt + 1}/${def.maxRetries + 1}): ${message}`,
        );
      } else {
        def.state.lastResult = 'failure';
        def.state.runCount++;
        def.state.lastRun = new Date();
        debugWarn(`❌ Job "${def.name}" failed after ${def.maxRetries + 1} attempt(s): ${message}`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Register a job with the Absolute Clock scheduler.
 * Throws if a job with the same name already exists.
 */
export function registerJob(def: Omit<JobDefinition, 'state'>): void {
  if (registry.has(def.name)) {
    throw new Error(`Job "${def.name}" is already registered`);
  }

  const fullDef: JobDefinition = { ...def, state: createInitialState() };

  registry.set(def.name, fullDef);

  if (fullDef.enabled) {
    startCronTask(fullDef);
  }

  debugLog(
    `📅 Registered job: ${def.name}  (cron: "${def.cron}"${def.enabled ? '' : ', disabled'})`,
  );
}

/** Unregister a previously-registered job, stopping its cron task. */
export function unregisterJob(name: string): boolean {
  stopCronTask(name);
  return registry.delete(name);
}

/** Return a sanitised list of all registered jobs (no handler function). */
export function listJobs(): JobInfo[] {
  const result: JobInfo[] = [];
  for (const def of registry.values()) {
    const { handler: _, ...info } = def; // eslint-disable-line @typescript-eslint/no-unused-vars
    result.push(info);
  }
  return result;
}

/** Return a single job's info, or `null` if not found. */
export function getJob(name: string): JobInfo | null {
  const def = registry.get(name);
  if (!def) return null;
  const { handler: _, ...info } = def; // eslint-disable-line @typescript-eslint/no-unused-vars
  return info;
}

/**
 * Immediately trigger a job execution, bypassing the cron schedule.
 * Returns `true` if the job was found, `false` otherwise.
 * The execution is fire-and-forget (errors are logged, not thrown).
 */
export function triggerJob(name: string): boolean {
  const def = registry.get(name);
  if (!def) return false;

  debugLog(`⚡ Manually triggering job "${def.name}"`);
  executeWithRetry(def);
  return true;
}

/**
 * Pause a job — stops its cron task but preserves its schedule definition.
 * Returns `true` if the job was running and is now paused.
 */
export function pauseJob(name: string): boolean {
  const def = registry.get(name);
  if (!def) return false;
  if (!def.enabled) return true; // already paused

  def.enabled = false;
  stopCronTask(name);
  debugLog(`⏸️ Paused job "${name}"`);
  return true;
}

/**
 * Resume a previously-paused job — restarts its cron task.
 * Returns `true` if the job was paused and is now running.
 */
export function resumeJob(name: string): boolean {
  const def = registry.get(name);
  if (!def) return false;
  if (def.enabled) return true; // already running

  def.enabled = true;
  startCronTask(def);
  debugLog(`▶️ Resumed job "${name}"`);
  return true;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function startCronTask(def: JobDefinition): void {
  // node-cron throws on invalid expressions — let it bubble up
  const task = cron.schedule(def.cron, async () => {
    await executeWithRetry(def);
  });
  cronTasks.set(def.name, task);
}

function stopCronTask(name: string): void {
  const task = cronTasks.get(name);
  if (task) {
    task.stop();
    cronTasks.delete(name);
  }
}
