import { Request, Response } from 'express';
import { getDatabase } from '../lib/database/database.js';
import { debugLog } from '../utils/debugLogger.js';
import { rescheduleJob } from '../jobs/jobSchedulerEngine.js';

interface CronJobRow {
  id: number;
  name: string;
  route_path: string;
  first_run_at: string;
  interval_seconds: number;
  is_active: number;
  created_at: string;
}

function validatePassword(req: Request): boolean {
  const password = req.query.password as string;
  const expectedPassword = process.env.ADMIN_PASSWORD || 'changeme123';
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

  // Allow internal cron job calls from the scheduler engine
  if (password === '__internal_cron__') {
    return true;
  }

  // In development, also accept 'debug' for easier testing
  if (isDevelopment && password === 'debug') {
    return true;
  }

  return password === expectedPassword;
}

function computeNextRun(firstRunAt: string, intervalSeconds: number): Date | null {
  const firstRun = new Date(firstRunAt).getTime();
  const now = Date.now();
  if (isNaN(firstRun)) return null;

  const intervalMs = intervalSeconds * 1000;
  if (intervalMs <= 0) return null;

  const elapsed = now - firstRun;
  if (elapsed <= 0) return new Date(firstRun);

  const n = Math.ceil(elapsed / intervalMs);
  return new Date(firstRun + n * intervalMs);
}

// GET /api/admin/cron-jobs
export const getCronJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validatePassword(req)) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM cron_jobs ORDER BY id ASC').all() as CronJobRow[];

    const jobs = rows.map((row) => {
      const nextRun = computeNextRun(row.first_run_at, row.interval_seconds);
      return {
        id: row.id,
        name: row.name,
        routePath: row.route_path,
        firstRunAt: row.first_run_at,
        intervalSeconds: row.interval_seconds,
        isActive: row.is_active === 1,
        createdAt: row.created_at,
        nextRunAt: nextRun ? nextRun.toISOString() : null,
      };
    });

    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Error fetching cron jobs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch cron jobs' });
  }
};

// POST /api/admin/cron-jobs
export const createCronJob = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validatePassword(req)) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    const { name, routePath, firstRunAt, intervalSeconds, isActive } = req.body;

    if (!name || !routePath || !intervalSeconds || intervalSeconds < 1) {
      res.status(400).json({ error: 'name, routePath, and intervalSeconds (>=1) are required' });
      return;
    }

    const db = getDatabase();
    const firstRun = firstRunAt || '1970-01-01T00:00:00.000Z';
    const active = isActive !== undefined ? (isActive ? 1 : 0) : 1;

    const stmt = db.prepare(`
      INSERT INTO cron_jobs (name, route_path, first_run_at, interval_seconds, is_active)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, routePath, firstRun, intervalSeconds, active);

    const newJob: CronJobRow = db.prepare('SELECT * FROM cron_jobs WHERE id = ?').get(result.lastInsertRowid) as CronJobRow;

    rescheduleJob(newJob.id);

    const nextRun = computeNextRun(newJob.first_run_at, newJob.interval_seconds);

    debugLog('✅ [cronJobController] Created cron job:', name);

    res.status(201).json({
      success: true,
      job: {
        id: newJob.id,
        name: newJob.name,
        routePath: newJob.route_path,
        firstRunAt: newJob.first_run_at,
        intervalSeconds: newJob.interval_seconds,
        isActive: newJob.is_active === 1,
        createdAt: newJob.created_at,
        nextRunAt: nextRun ? nextRun.toISOString() : null,
      },
    });
  } catch (error: any) {
    if (error?.message?.includes('UNIQUE constraint')) {
      res.status(409).json({ error: 'A cron job with this name already exists' });
      return;
    }
    console.error('Error creating cron job:', error);
    res.status(500).json({ success: false, error: 'Failed to create cron job' });
  }
};

// PUT /api/admin/cron-jobs/:id
export const updateCronJob = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validatePassword(req)) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    const { id } = req.params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      res.status(400).json({ error: 'Invalid cron job ID' });
      return;
    }

    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM cron_jobs WHERE id = ?').get(numericId) as CronJobRow | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Cron job not found' });
      return;
    }

    const { name, routePath, firstRunAt, intervalSeconds, isActive } = req.body;

    const updatedName = name !== undefined ? name : existing.name;
    const updatedRoute = routePath !== undefined ? routePath : existing.route_path;
    const updatedFirstRun = firstRunAt !== undefined ? firstRunAt : existing.first_run_at;
    const updatedInterval = intervalSeconds !== undefined ? intervalSeconds : existing.interval_seconds;
    const updatedActive = isActive !== undefined ? (isActive ? 1 : 0) : existing.is_active;

    const stmt = db.prepare(`
      UPDATE cron_jobs
      SET name = ?, route_path = ?, first_run_at = ?, interval_seconds = ?, is_active = ?
      WHERE id = ?
    `);
    stmt.run(updatedName, updatedRoute, updatedFirstRun, updatedInterval, updatedActive, numericId);

    const updated: CronJobRow = db.prepare('SELECT * FROM cron_jobs WHERE id = ?').get(numericId) as CronJobRow;

    rescheduleJob(updated.id);

    const nextRun = computeNextRun(updated.first_run_at, updated.interval_seconds);

    debugLog('✅ [cronJobController] Updated cron job:', updated.name);

    res.json({
      success: true,
      job: {
        id: updated.id,
        name: updated.name,
        routePath: updated.route_path,
        firstRunAt: updated.first_run_at,
        intervalSeconds: updated.interval_seconds,
        isActive: updated.is_active === 1,
        createdAt: updated.created_at,
        nextRunAt: nextRun ? nextRun.toISOString() : null,
      },
    });
  } catch (error: any) {
    if (error?.message?.includes('UNIQUE constraint')) {
      res.status(409).json({ error: 'A cron job with this name already exists' });
      return;
    }
    console.error('Error updating cron job:', error);
    res.status(500).json({ success: false, error: 'Failed to update cron job' });
  }
};

// DELETE /api/admin/cron-jobs/:id
export const deleteCronJob = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validatePassword(req)) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    const { id } = req.params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      res.status(400).json({ error: 'Invalid cron job ID' });
      return;
    }

    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM cron_jobs WHERE id = ?').get(numericId) as CronJobRow | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Cron job not found' });
      return;
    }

    db.prepare('DELETE FROM cron_jobs WHERE id = ?').run(numericId);

    rescheduleJob(numericId, true);

    debugLog('🗑️ [cronJobController] Deleted cron job:', existing.name);

    res.json({ success: true, message: 'Cron job deleted successfully' });
  } catch (error) {
    console.error('Error deleting cron job:', error);
    res.status(500).json({ success: false, error: 'Failed to delete cron job' });
  }
};

