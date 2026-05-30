import { Request, Response } from 'express';
import { getDatabase } from '../lib/database/database.js';
import { computeNextRun, reloadJob, removeJob } from '../jobs/jobSchedulerEngine.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CronJobInput {
  name?: string;
  route_path?: string;
  first_run_at?: string;
  interval_seconds?: number;
  is_active?: number;
}

// ---------------------------------------------------------------------------
// Auth helper (same pattern as adminController)
// ---------------------------------------------------------------------------

function validatePassword(req: Request): boolean {
  const password = req.query.password as string;
  const expectedPassword = process.env.ADMIN_PASSWORD || 'changeme123';
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  if (isDevelopment && password === 'debug') return true;
  return password === expectedPassword;
}

function unauthorized(res: Response): void {
  res.status(401).json({ error: 'Invalid password' });
}

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

export function getCronJobs(req: Request, res: Response): void {
  if (!validatePassword(req)) {
    unauthorized(res);
    return;
  }

  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM cron_jobs ORDER BY id ASC').all() as any[];

  const jobs = rows.map((row) => ({
    id: row.id,
    name: row.name,
    route_path: row.route_path,
    first_run_at: row.first_run_at,
    interval_seconds: row.interval_seconds,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
    next_run_at: computeNextRun(row)?.toISOString() || null,
  }));

  res.json({ success: true, jobs });
}

export function createCronJob(req: Request, res: Response): void {
  if (!validatePassword(req)) {
    unauthorized(res);
    return;
  }

  const { name, route_path, first_run_at, interval_seconds, is_active } = req.body as CronJobInput;

  if (!name || !route_path) {
    res.status(400).json({ error: 'name and route_path are required' });
    return;
  }

  const db = getDatabase();

  // Check for duplicate name
  const existing = db.prepare('SELECT id FROM cron_jobs WHERE name = ?').get(name);
  if (existing) {
    res.status(409).json({ error: `A cron job named "${name}" already exists` });
    return;
  }

  const result = db
    .prepare(
      `
    INSERT INTO cron_jobs (name, route_path, first_run_at, interval_seconds, is_active)
    VALUES (?, ?, ?, ?, ?)
  `,
    )
    .run(
      name,
      route_path,
      first_run_at || '1970-01-01T00:00:00.000Z',
      interval_seconds ?? 3600,
      is_active ?? 1,
    );

  const newId = result.lastInsertRowid as number;

  // Schedule the new job if active
  if (is_active ?? 1) {
    reloadJob(newId);
  }

  res.status(201).json({ success: true, id: newId, message: `Cron job "${name}" created` });
}

export function updateCronJob(req: Request, res: Response): void {
  if (!validatePassword(req)) {
    unauthorized(res);
    return;
  }

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid job id' });
    return;
  }

  const db = getDatabase();
  const existing = db.prepare('SELECT * FROM cron_jobs WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Cron job not found' });
    return;
  }

  const { name, route_path, first_run_at, interval_seconds, is_active } = req.body as CronJobInput;

  // If renaming, check for duplicate
  if (name && name !== existing.name) {
    const dup = db.prepare('SELECT id FROM cron_jobs WHERE name = ? AND id != ?').get(name, id);
    if (dup) {
      res.status(409).json({ error: `A cron job named "${name}" already exists` });
      return;
    }
  }

  db.prepare(
    `
    UPDATE cron_jobs SET
      name = ?, route_path = ?, first_run_at = ?, interval_seconds = ?,
      is_active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
  ).run(
    name ?? existing.name,
    route_path ?? existing.route_path,
    first_run_at ?? existing.first_run_at,
    interval_seconds ?? existing.interval_seconds,
    is_active ?? existing.is_active,
    id,
  );

  // Re-schedule the job with updated settings
  try {
    reloadJob(id);
  } catch (err) {
    console.error('Error re-scheduling cron job:', err);
    // Non-fatal — the DB update succeeded, scheduling failure is logged
  }

  res.json({ success: true, message: `Cron job updated` });
}

export function deleteCronJob(req: Request, res: Response): void {
  if (!validatePassword(req)) {
    unauthorized(res);
    return;
  }

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid job id' });
    return;
  }

  const db = getDatabase();
  const existing = db.prepare('SELECT id FROM cron_jobs WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: 'Cron job not found' });
    return;
  }

  // Remove timer first
  removeJob(id);

  db.prepare('DELETE FROM cron_jobs WHERE id = ?').run(id);

  res.json({ success: true, message: 'Cron job deleted' });
}
