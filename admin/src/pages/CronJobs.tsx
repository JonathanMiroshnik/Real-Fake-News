import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchCronJobs, createCronJob, updateCronJob, deleteCronJob } from '../api/adminApi';

interface CronJob {
  id: number;
  name: string;
  routePath: string;
  firstRunAt: string;
  intervalSeconds: number;
  isActive: boolean;
  createdAt: string;
  nextRunAt: string | null;
}

function formatInterval(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join(' ');
}

function toLocalDatetimeString(iso: string): string {
  if (!iso) return '1970-01-01T00:00';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '1970-01-01T00:00';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const EMPTY_JOB = {
  name: '',
  routePath: '',
  firstRunAt: '1970-01-01T00:00',
  intervalSeconds: 86400,
  isActive: true,
};

export default function CronJobs() {
  const [searchParams] = useSearchParams();
  const password = searchParams.get('pwd') || '';

  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [newJobs, setNewJobs] = useState<typeof EMPTY_JOB[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<CronJob | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await fetchCronJobs();
    if (result.error) {
      setError(result.error);
    } else {
      setJobs(result.jobs || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  async function handleSave(job: CronJob) {
    setSaving(job.id);
    setError('');
    const err = await updateCronJob(job.id, {
      name: job.name,
      routePath: job.routePath,
      firstRunAt: job.firstRunAt,
      intervalSeconds: job.intervalSeconds,
      isActive: job.isActive,
    });
    if (err) setError(err);
    setSaving(null);
    await loadJobs();
  }

  async function handleToggle(job: CronJob) {
    await updateCronJob(job.id, { isActive: !job.isActive });
    await loadJobs();
  }

  function updateField(id: number, field: keyof CronJob, value: any) {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, [field]: value } : j)));
  }

  function addNewJob() {
    setNewJobs((prev) => [...prev, { ...EMPTY_JOB }]);
  }

  function removeNewJob(index: number) {
    setNewJobs((prev) => prev.filter((_, i) => i !== index));
  }

  function updateNewJob(index: number, field: string, value: any) {
    setNewJobs((prev) => prev.map((j, i) => (i === index ? { ...j, [field]: value } : j)));
  }

  async function handleCreate(index: number) {
    const job = newJobs[index];
    if (!job.name || !job.routePath) {
      setError('Name and Route Path are required');
      return;
    }
    setSaving(-index - 1);
    setError('');
    const err = await createCronJob({
      name: job.name,
      routePath: job.routePath,
      firstRunAt: job.firstRunAt ? new Date(job.firstRunAt).toISOString() : undefined,
      intervalSeconds: job.intervalSeconds,
      isActive: job.isActive,
    });
    if (err) {
      setError(err);
      setSaving(null);
      return;
    }
    setSaving(null);
    setNewJobs((prev) => prev.filter((_, i) => i !== index));
    await loadJobs();
  }

  async function handleDelete(job: CronJob) {
    setError('');
    const err = await deleteCronJob(job.id);
    if (err) setError(err);
    setDeleteTarget(null);
    await loadJobs();
  }

  if (!password) {
    return (
      <div className="unauthorized">
        <h1>Access Denied</h1>
        <p>
          This page requires authorization. Add <code>?pwd=YOUR_PASSWORD</code> to the URL.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>⏰ Cron Jobs</h1>
          <p className="subtitle">Schedule recurring server tasks on an absolute calendar clock</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="config-info" style={{ marginBottom: "1.5rem" }}>
        <div className="info-item">
          <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.6 }}>
            <strong>Absolute scheduling:</strong> Each cron job runs based on its <strong>"First Run"</strong> date/time + the interval.
            The server makes a POST request to the route path when the job fires.
            Default "First Run" is the start of Unix time (<code>1970-01-01 00:00</code>).
          </p>
        </div>
      </div>

      {loading && jobs.length === 0 ? (
        <div className="loading">
          <div className="spinner" />
          Loading cron jobs...
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {jobs.map((job) => (
            <div
              key={job.id}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-lg)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px", flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      style={{ opacity: 0, width: 0, height: 0 }}
                      checked={job.isActive}
                      onChange={() => handleToggle(job)}
                    />
                    <span style={{
                      position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
                      background: job.isActive ? "#22c55e" : "#e2e8f0",
                      borderRadius: "24px", transition: "0.2s",
                    }}>
                      <span style={{
                        position: "absolute", height: "18px", width: "18px",
                        left: job.isActive ? "23px" : "3px", bottom: "3px",
                        background: "#fff", borderRadius: "50%", transition: "0.2s",
                      }} />
                    </span>
                  </label>
                  <span style={{
                    fontSize: "0.82rem", fontWeight: 600,
                    color: job.isActive ? "#16a34a" : "#94a3b8",
                  }}>
                    {job.isActive ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px 24px", alignItems: "flex-end" }}>
                <div className="form-group" style={{ flex: "1.5", minWidth: "140px", marginBottom: 0 }}>
                  <label>Job Name</label>
                  <input
                    type="text"
                    value={job.name}
                    onChange={(e) => updateField(job.id, "name", e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ flex: "2", minWidth: "180px", marginBottom: 0 }}>
                  <label>Route Path <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 400, textTransform: "none" }}>(POST)</span></label>
                  <input
                    type="text"
                    value={job.routePath}
                    style={{ fontFamily: "var(--font-mono)" }}
                    onChange={(e) => updateField(job.id, "routePath", e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ flex: "1", minWidth: "170px", marginBottom: 0 }}>
                  <label>First Run</label>
                  <input
                    type="datetime-local"
                    value={toLocalDatetimeString(job.firstRunAt)}
                    onChange={(e) => updateField(job.id, "firstRunAt", new Date(e.target.value).toISOString())}
                  />
                </div>
                <div className="form-group" style={{ flex: "0.8", minWidth: "130px", marginBottom: 0, position: "relative" }}>
                  <label>Interval (seconds)</label>
                  <input
                    type="number"
                    value={job.intervalSeconds}
                    min={1} step={1}
                    onChange={(e) => updateField(job.id, "intervalSeconds", parseInt(e.target.value) || 1)}
                    title={formatInterval(job.intervalSeconds)}
                  />
                </div>
                <div className="form-group" style={{ flex: "1", minWidth: "170px", marginBottom: 0 }}>
                  <label>Next Run</label>
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem",
                      color: "#64748b", padding: "6px 10px", background: "#f8fafc",
                      borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)",
                      height: "38px", overflow: "hidden",
                    }}
                    title={job.nextRunAt ? (() => {
                      const diff = new Date(job.nextRunAt).getTime() - Date.now();
                      if (diff <= 0) return "Should run now";
                      const mins = Math.floor(diff / 60000);
                      const hrs = Math.floor(mins / 60);
                      const remMins = mins % 60;
                      const secs = Math.floor((diff % 60000) / 1000);
                      return `⏳ ${hrs > 0 ? `${hrs}h ` : ""}${remMins > 0 || hrs > 0 ? `${remMins}m ` : ""}${secs}s`;
                    })() : "No schedule"}
                  >
                    📅
                    <span style={{ color: "#1e293b", fontWeight: 600, flexShrink: 0 }}>
                      {job.nextRunAt ? new Date(job.nextRunAt).toLocaleString() : "N/A"}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleSave(job)} disabled={saving === job.id}>
                    {saving === job.id ? "Saving..." : "💾 Save"}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(job)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}

          {/* New job forms */}
          {newJobs.map((job, index) => (
            <div
              key={`new-${index}`}
              style={{
                background: "#fefce8",
                border: "1.5px dashed #f59e0b",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-lg)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                ✨ New Cron Job
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px 24px", alignItems: "flex-end" }}>
                <div className="form-group" style={{ flex: "1.5", minWidth: "140px", marginBottom: 0 }}>
                  <label>Job Name</label>
                  <input type="text" value={job.name} placeholder="My Cron Job" onChange={(e) => updateNewJob(index, "name", e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: "2", minWidth: "180px", marginBottom: 0 }}>
                  <label>Route Path <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 400, textTransform: "none" }}>(POST)</span></label>
                  <input type="text" value={job.routePath} placeholder="/api/admin/..." style={{ fontFamily: "var(--font-mono)" }} onChange={(e) => updateNewJob(index, "routePath", e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: "1", minWidth: "170px", marginBottom: 0 }}>
                  <label>First Run</label>
                  <input type="datetime-local" value={job.firstRunAt} onChange={(e) => updateNewJob(index, "firstRunAt", e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: "0.8", minWidth: "130px", marginBottom: 0 }}>
                  <label>Interval (seconds)</label>
                  <input type="number" value={job.intervalSeconds} min={1} step={1} onChange={(e) => updateNewJob(index, "intervalSeconds", parseInt(e.target.value) || 1)} title={formatInterval(job.intervalSeconds)} />
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button className="btn btn-success btn-sm" onClick={() => handleCreate(index)} disabled={saving === -index - 1}>
                    {saving === -index - 1 ? "Creating..." : "✅ Create"}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeNewJob(index)}>✕ Cancel</button>
                </div>
              </div>
            </div>
          ))}

          <button
            className="btn btn-ghost"
            onClick={addNewJob}
            style={{
              marginTop: "8px",
              border: "2px dashed var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "18px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontSize: "1rem",
            }}
          >
            <span style={{ fontSize: "1.3rem" }}>+</span> Add New Cron Job
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
        >
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "28px 32px",
              maxWidth: "440px",
              width: "100%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
          >
            <h3 style={{ fontSize: "1.1rem", marginBottom: "12px", color: "var(--color-text)" }}>🗑️ Delete Cron Job</h3>
            <p style={{ fontSize: "0.92rem", color: "var(--color-text-secondary)", lineHeight: 1.5, marginBottom: "24px" }}>
              Are you sure you want to delete the "<strong>{deleteTarget.name}</strong>" cron job? This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteTarget)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
