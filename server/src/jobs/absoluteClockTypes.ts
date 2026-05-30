/**
 * TypeScript interfaces for the Absolute Clock scheduler.
 *
 * These types define the shape of job definitions, job state,
 * and status strings used by the scheduler engine.
 */

/** Runtime state that tracks a job's execution history. */
export interface JobState {
  lastRun: Date | null;
  lastResult: 'success' | 'failure' | null;
  lastError: string | null;
  runCount: number;
  errorCount: number;
}

/** Full definition of a scheduled job. */
export interface JobDefinition {
  /** Unique job identifier (e.g. "article-generation"). */
  name: string;
  /** Human-readable description of what this job does. */
  description: string;
  /** Cron expression (e.g. "0 /6 * * *"). */
  cron: string;
  /** Whether the job is enabled and should run on schedule. */
  enabled: boolean;
  /** Maximum number of retry attempts before marking as failed. */
  maxRetries: number;
  /** Maximum execution time in milliseconds before the job is aborted. */
  timeoutMs: number;
  /** The actual work function. */
  handler: () => Promise<void>;
  /** Runtime state — mutated as the job runs. */
  state: JobState;
}

/** Sanitised view of a job for API consumers (no handler function). */
export type JobInfo = Omit<JobDefinition, 'handler'>;

/** Status string for API responses. */
export type JobStatus = 'running' | 'paused' | 'error';
