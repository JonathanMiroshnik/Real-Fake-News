/**
 * How a registry entry repeats, reduced to "start it, get a handle that stops it".
 *
 * This lives apart from `scheduler.ts` so that file describes *what* is scheduled
 * while this one owns *how* it repeats. A registry that touched `node-cron`
 * directly could not be tested without leaving timers behind.
 *
 * Cron is the only mechanism. `startRandomInterval()` in `utils/general.ts` used to
 * drive news fetching, article writing and recipe generation, but the timing never
 * reached the reader: content is produced by the jobs and consumed by the REST
 * routes, and the two do not meet on a shared clock (see "Producer-Consumer model"
 * in `contracts/architecture.md`). A fixed grid is therefore strictly easier to
 * reason about — see roadmap entry 14 in `plans/README.md` for what was considered
 * and deferred.
 */
import cron from 'node-cron';

/** Cancels a started schedule. Calling it twice is harmless. */
export type StopSchedule = () => void;

/** A job body as the scheduler sees it: anything awaitable, or nothing at all. */
export type JobBody = () => Promise<void> | void;

/** A fixed time of day: `0 0 * * *` is midnight, every day. */
export interface CronSchedule {
  kind: 'cron';
  expression: string;
}

/** A job's repeating shape — today always a cron expression. */
export type JobSchedule = CronSchedule;

/**
 * Registers `run` with `node-cron`.
 *
 * @param expression A five- or six-field cron expression.
 * @param run The job body; errors are its own business (every job logs and
 *   swallows, so one failure cannot stop the schedule).
 * @returns A handle that destroys the cron task.
 */
export function startCronSchedule(expression: string, run: JobBody): StopSchedule {
  const task = cron.schedule(expression, () => {
    void run();
  });

  return () => {
    void task.destroy();
  };
}
