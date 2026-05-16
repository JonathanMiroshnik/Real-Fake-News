import { useState, useEffect, useCallback } from 'react';
import { fetchCronJobs, saveCronJob, createCronJob, deleteCronJob } from '../api/adminApi';
import type { CronJobData } from '../api/adminApi';

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '\u2014';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function computeCountdown(nextRunAt: string | null | undefined): string {
  if (!nextRunAt) return '';
  const ms = new Date(nextRunAt).getTime() - Date.now();
  if (ms <= 0) return 'now';
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

function fmtIntervalTooltip(sec: number): string {
  const m = sec / 60;
  const h = sec / 3600;
  const d = sec / 86400;
  return `${sec} sec  |  ${m.toFixed(1)} min\n${h.toFixed(2)} hr  |  ${d.toFixed(2)} day`;
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface EditingRow {
  name: string;
  route_path: string;
  first_run_at: string;
  interval_seconds: number;
  is_active: number;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function CronJobs() {
  const [jobs, setJobs] = useState<CronJobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CronJobData | null>(null);
  const [edits, setEdits] = useState<Map<number, EditingRow>>(new Map());
  const [newJob, setNewJob] = useState<EditingRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const r = await fetchCronJobs();
    if (r.error) setError(r.error);
    setJobs(r.jobs);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(''), 3000);
    return () => clearTimeout(t);
  }, [success]);

  function getEdit(job: CronJobData): EditingRow {
    const cached = edits.get(job.id!);
    if (cached) return cached;
    return {
      name: job.name,
      route_path: job.route_path,
      first_run_at: job.first_run_at?.slice(0, 16) || '1970-01-01T00:00',
      interval_seconds: job.interval_seconds,
      is_active: job.is_active,
    };
  }

  function setEditField(jobId: number, field: keyof EditingRow, value: string | number) {
    setEdits((prev) => {
      const next = new Map(prev);
      const current =
        next.get(jobId) ||
        (() => {
          const j = jobs.find((x) => x.id === jobId)!;
          return {
            name: j.name,
            route_path: j.route_path,
            first_run_at: j.first_run_at?.slice(0, 16) || '1970-01-01T00:00',
            interval_seconds: j.interval_seconds,
            is_active: j.is_active,
          };
        })();
      next.set(jobId, { ...current, [field]: value });
      return next;
    });
  }

  async function handleSave(jobId: number) {
    setSavingId(jobId);
    setError('');
    setSuccess('');
    const data = edits.get(jobId);
    if (!data) return;

    // Convert the local datetime back to ISO for the server
    const payload = {
      ...data,
      first_run_at: new Date(data.first_run_at).toISOString(),
    };

    const err = await saveCronJob(jobId, payload);
    setSavingId(null);
    if (err) {
      setError(err);
    } else {
      setSuccess(`Cron job saved`);
      setEdits((prev) => {
        const n = new Map(prev);
        n.delete(jobId);
        return n;
      });
      await load();
    }
  }

  async function handleToggle(job: CronJobData) {
    setError('');
    setSuccess('');
    const err = await saveCronJob(job.id!, { is_active: job.is_active ? 0 : 1 });
    if (err) {
      setError(err);
    } else {
      setSuccess(job.is_active ? 'Job paused' : 'Job resumed');
      await load();
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setError('');
    setSuccess('');
    const err = await deleteCronJob(deleteTarget.id!);
    setDeleteTarget(null);
    if (err) {
      setError(err);
    } else {
      setSuccess(`Cron job "${deleteTarget.name}" deleted`);
      await load();
    }
  }

  async function handleAddNew() {
    if (!newJob?.name || !newJob?.route_path) {
      setError('Name and route path are required');
      return;
    }
    setError('');
    setSuccess('');
    const result = await createCronJob({
      name: newJob.name,
      route_path: newJob.route_path,
      first_run_at: new Date(newJob.first_run_at).toISOString(),
      interval_seconds: newJob.interval_seconds,
      is_active: 1,
    });
    setNewJob(null);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(`Cron job "${newJob.name}" created`);
      await load();
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="cronjobs-page">
      <header className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1
          style={{
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.75rem',
          }}
        >
          Cron Jobs
        </h1>
        <p
          className="subtitle"
          style={{ color: '#64748b', fontSize: '0.9375rem', marginTop: '0.25rem' }}
        >
          Schedule recurring server tasks on an absolute calendar clock.
        </p>
      </header>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {loading && jobs.length === 0 ? (
        <div className="loading">Loading cron jobs...</div>
      ) : (
        <>
          {jobs.map((job) => {
            const edit = getEdit(job);
            const cd = computeCountdown(job.next_run_at);
            return (
              <div key={job.id} className="card" style={{ marginBottom: '1rem' }}>
                <div
                  className="card-header"
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      className={`toggle-label ${edit.is_active ? 'enabled' : 'disabled'}`}
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: edit.is_active ? '#16a34a' : '#dc2626',
                      }}
                    >
                      {edit.is_active ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      className={`toggle ${edit.is_active ? 'on' : ''}`}
                      onClick={() => handleToggle(job)}
                      aria-label="Toggle cron job"
                      style={{
                        position: 'relative',
                        width: 44,
                        height: 24,
                        background: edit.is_active ? '#22c55e' : '#cbd5e1',
                        borderRadius: 12,
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'background 200ms',
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: 2,
                          left: edit.is_active ? 22 : 2,
                          width: 20,
                          height: 20,
                          background: '#fff',
                          borderRadius: '50%',
                          transition: 'transform 200ms',
                        }}
                      />
                    </button>
                  </div>
                </div>

                <div
                  className="field-row"
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    className="field-group"
                    style={{
                      flex: '2',
                      minWidth: 160,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Job Name
                    </label>
                    <input
                      type="text"
                      value={edit.name}
                      onChange={(e) => setEditField(job.id!, 'name', e.target.value)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: 6,
                        fontSize: '0.875rem',
                        fontFamily: 'inherit',
                        color: '#1e293b',
                        background: '#fff',
                        outline: 'none',
                        width: '100%',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                      onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                    />
                  </div>
                  <div
                    className="field-group"
                    style={{
                      flex: '3',
                      minWidth: 220,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Route Path{' '}
                      <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.65rem' }}>
                        (POST request)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={edit.route_path}
                      onChange={(e) => setEditField(job.id!, 'route_path', e.target.value)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: 6,
                        fontSize: '0.8125rem',
                        fontFamily: "'JetBrains Mono','Fira Code',monospace",
                        color: '#1e293b',
                        background: '#fff',
                        outline: 'none',
                        width: '100%',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                      onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                    />
                  </div>
                  <div
                    className="field-group"
                    style={{
                      flex: '1.5',
                      minWidth: 180,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      First Run
                    </label>
                    <input
                      type="datetime-local"
                      value={edit.first_run_at}
                      onChange={(e) => setEditField(job.id!, 'first_run_at', e.target.value)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: 6,
                        fontSize: '0.875rem',
                        fontFamily: 'inherit',
                        color: '#1e293b',
                        background: '#fff',
                        outline: 'none',
                        width: '100%',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                      onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                    />
                  </div>
                  <div
                    className="field-group"
                    style={{
                      flex: '1',
                      minWidth: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Interval (sec)
                    </label>
                    <div
                      className="interval-wrap"
                      style={{ position: 'relative', display: 'inline-block' }}
                    >
                      <input
                        type="number"
                        value={edit.interval_seconds}
                        min={1}
                        onChange={(e) =>
                          setEditField(job.id!, 'interval_seconds', parseInt(e.target.value) || 1)
                        }
                        style={{
                          padding: '0.5rem 0.75rem',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: 6,
                          fontSize: '0.875rem',
                          fontFamily: 'inherit',
                          color: '#1e293b',
                          background: '#fff',
                          outline: 'none',
                          width: '100%',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                        onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                      />
                      <div
                        className="interval-tooltip"
                        style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 6px)',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#1e293b',
                          color: '#e2e8f0',
                          fontSize: '0.75rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 6,
                          whiteSpace: 'nowrap',
                          opacity: 0,
                          pointerEvents: 'none',
                          transition: 'opacity 150ms',
                          zIndex: 10,
                          lineHeight: 1.6,
                        }}
                      >
                        {fmtIntervalTooltip(edit.interval_seconds)}
                      </div>
                    </div>
                  </div>
                  <div
                    className="field-group"
                    style={{
                      flex: '1.5',
                      minWidth: 160,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Next Run
                    </label>
                    <div
                      className="nextrun-box"
                      style={{
                        padding: '0.5rem 0.75rem',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: 6,
                        fontSize: '0.8125rem',
                        background: '#f8fafc',
                        color: '#475569',
                        fontFamily: "'JetBrains Mono','Fira Code',monospace",
                        cursor: 'help',
                        position: 'relative',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {job.is_active ? ` ${fmtDate(job.next_run_at)}` : '  Paused'}
                      {cd && (
                        <span
                          className="nextrun-tooltip"
                          style={{
                            position: 'absolute',
                            bottom: 'calc(100% + 6px)',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#1e293b',
                            color: '#e2e8f0',
                            fontSize: '0.75rem',
                            fontFamily: 'Inter, sans-serif',
                            padding: '0.375rem 0.625rem',
                            borderRadius: 6,
                            whiteSpace: 'nowrap',
                            opacity: 0,
                            pointerEvents: 'none',
                            transition: 'opacity 150ms',
                            zIndex: 10,
                          }}
                        >
                          in {cd}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="card-actions"
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #f1f5f9',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    className="btn btn-save"
                    onClick={() => handleSave(job.id!)}
                    disabled={savingId === job.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.5rem 1rem',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      transition: 'all 150ms',
                      background: savingId === job.id ? '#94a3b8' : '#22c55e',
                      color: '#fff',
                    }}
                  >
                    {savingId === job.id ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    className="btn btn-delete"
                    onClick={() => setDeleteTarget(job)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.5rem 1rem',
                      border: '1px solid #fecaca',
                      borderRadius: 8,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      transition: 'all 150ms',
                      background: '#fef2f2',
                      color: '#dc2626',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}

          {/* ── New Job Form ── */}
          {newJob ? (
            <div className="card" style={{ marginBottom: '1rem', border: '2px dashed #6366f1' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#6366f1' }}>
                  New Cron Job
                </span>
              </div>
              <div
                className="field-row"
                style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}
              >
                <div
                  className="field-group"
                  style={{
                    flex: '2',
                    minWidth: 160,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  <label
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Job Name
                  </label>
                  <input
                    type="text"
                    placeholder="My Cron Job"
                    value={newJob.name}
                    onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                    style={{
                      padding: '0.5rem 0.75rem',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: 6,
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      width: '100%',
                    }}
                  />
                </div>
                <div
                  className="field-group"
                  style={{
                    flex: '3',
                    minWidth: 220,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  <label
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Route Path
                  </label>
                  <input
                    type="text"
                    placeholder="/api/admin/..."
                    value={newJob.route_path}
                    onChange={(e) => setNewJob({ ...newJob, route_path: e.target.value })}
                    style={{
                      padding: '0.5rem 0.75rem',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: 6,
                      fontSize: '0.8125rem',
                      fontFamily: "'JetBrains Mono','Fira Code',monospace",
                      outline: 'none',
                      width: '100%',
                    }}
                  />
                </div>
                <div
                  className="field-group"
                  style={{
                    flex: '1.5',
                    minWidth: 180,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  <label
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    First Run
                  </label>
                  <input
                    type="datetime-local"
                    value={newJob.first_run_at}
                    onChange={(e) => setNewJob({ ...newJob, first_run_at: e.target.value })}
                    style={{
                      padding: '0.5rem 0.75rem',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: 6,
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      width: '100%',
                    }}
                  />
                </div>
                <div
                  className="field-group"
                  style={{
                    flex: '1',
                    minWidth: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  <label
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Interval (sec)
                  </label>
                  <input
                    type="number"
                    value={newJob.interval_seconds}
                    min={1}
                    onChange={(e) =>
                      setNewJob({ ...newJob, interval_seconds: parseInt(e.target.value) || 1 })
                    }
                    style={{
                      padding: '0.5rem 0.75rem',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: 6,
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      width: '100%',
                    }}
                  />
                </div>
                <div
                  className="field-group"
                  style={{
                    flex: '1.5',
                    minWidth: 160,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  <label
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      opacity: 0,
                    }}
                  >
                    Action
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-save"
                      onClick={handleAddNew}
                      style={{
                        padding: '0.5rem 1rem',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                        background: '#22c55e',
                        color: '#fff',
                      }}
                    >
                      Create
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => setNewJob(null)}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                        background: 'transparent',
                        color: '#64748b',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              className="btn-add"
              onClick={() =>
                setNewJob({
                  name: '',
                  route_path: '',
                  first_run_at: '1970-01-01T00:00',
                  interval_seconds: 3600,
                  is_active: 1,
                })
              }
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px dashed #cbd5e1',
                borderRadius: 12,
                background: 'none',
                color: '#64748b',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 150ms',
                marginBottom: '2rem',
              }}
            >
              + Add New Cron Job
            </button>
          )}
        </>
      )}

      {/* ── How It Works ── */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          background: '#f8fafc',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          marginTop: '1rem',
        }}
      >
        <h3
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#475569',
            marginBottom: '0.5rem',
          }}
        >
          How Next Run Is Calculated
        </h3>
        <p
          style={{
            fontSize: '0.8125rem',
            color: '#64748b',
            fontFamily: "'JetBrains Mono','Fira Code',monospace",
          }}
        >
          nextRun = firstRun + N &times; intervalSeconds &nbsp;where&nbsp; N = ceil((now - firstRun)
          / intervalSeconds)
        </p>
      </div>

      {/* ── Delete Modal ── */}
      {deleteTarget && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteTarget(null);
          }}
        >
          <div
            className="modal"
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: '1.5rem 2rem',
              maxWidth: 420,
              width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Delete Cron Job</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Are you sure you want to delete the <strong>{deleteTarget.name}</strong> cron job?
              This action cannot be undone.
            </p>
            <div
              className="modal-actions"
              style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}
            >
              <button
                className="btn btn-cancel"
                onClick={() => setDeleteTarget(null)}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  background: '#f1f5f9',
                  color: '#475569',
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  background: '#dc2626',
                  color: '#fff',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <p style={{ color: '#94a3b8', fontSize: '0.75rem', textAlign: 'center', marginTop: '2rem' }}>
        Cron jobs execute via internal HTTP POST to the specified route path.
      </p>
    </div>
  );
}
