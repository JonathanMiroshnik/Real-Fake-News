import { useState, useEffect, useCallback } from 'react';

interface ConfigSetting {
  key: string;
  value: string;
  type: 'string' | 'boolean' | 'number';
  description: string;
  category: string;
}

interface ConfigData {
  [key: string]: ConfigSetting;
}

const CONFIG_LABELS: Record<string, string> = {
  articlesPerDay: 'Articles to generate per day',
  recipesPerDay: 'Recipes to generate per day',
  articleGenerationIntervalHours: 'Article generation interval (hours)',
  newsFetchIntervalHours: 'News fetching interval (hours)',
  minAcceptableArticles: 'Minimum acceptable articles before fallback',
  enableScheduledJobs: 'Enable scheduled jobs',
};

const CONFIG_SECTIONS = [
  {
    title: 'Content Generation',
    icon: '📰',
    keys: ['articlesPerDay', 'recipesPerDay'],
  },
  {
    title: 'Scheduling & Intervals',
    icon: '⏰',
    keys: ['articleGenerationIntervalHours', 'newsFetchIntervalHours'],
  },
  {
    title: 'System',
    icon: '⚙️',
    keys: ['minAcceptableArticles', 'enableScheduledJobs'],
  },
];

function ConfigField({
  keyName,
  label,
  setting,
  value,
  onChange,
}: {
  keyName: string;
  label: string;
  setting: ConfigSetting;
  value: string;
  onChange: (key: string, value: string) => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  let tooltipTimer: ReturnType<typeof setTimeout> | null = null;

  function handleMouseEnter() {
    tooltipTimer = setTimeout(() => setShowTooltip(true), 400);
  }

  function handleMouseLeave() {
    if (tooltipTimer) clearTimeout(tooltipTimer);
    setShowTooltip(false);
  }

  const fieldId = `config-${keyName}`;

  return (
    <div className="config-field">
      <div className="config-field-inner">
        <div className="config-field-header">
          <label className="config-label" htmlFor={fieldId}>
            {label}
          </label>
          <span
            className="config-help-icon"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="button"
            tabIndex={0}
            onFocus={handleMouseEnter}
            onBlur={handleMouseLeave}
            aria-label={`Help for ${label}`}
          >
            ?
            {showTooltip && (
              <span className="config-tooltip">{setting.description}</span>
            )}
          </span>
        </div>

        {setting.type === 'boolean' ? (
          <label className="config-checkbox-label">
            <input
              id={fieldId}
              type="checkbox"
              checked={value === 'true'}
              onChange={(e) =>
                onChange(keyName, e.target.checked ? 'true' : 'false')
              }
            />
            <span className="checkbox-custom" />
            Enabled
          </label>
        ) : (
          <input
            id={fieldId}
            type={setting.type === 'number' ? 'number' : 'text'}
            className="config-input"
            value={value}
            min={0}
            onChange={(e) => onChange(keyName, e.target.value)}
          />
        )}
      </div>
    </div>
  );
}

async function fetchConfig(): Promise<{ config: ConfigData | null; error?: string }> {
  try {
    const params = new URLSearchParams(window.location.search);
    const password = params.get('pwd') || '';
    const url = `/api/admin/config?password=${encodeURIComponent(password)}&_t=${Date.now()}`;
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return { config: data.config || null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch config';
    console.error('Error fetching config:', err);
    return { config: null, error: message };
  }
}

async function saveConfig(
  config: Record<string, string>,
): Promise<{ error?: string }> {
  try {
    const params = new URLSearchParams(window.location.search);
    const password = params.get('pwd') || '';
    const url = `/api/admin/config?password=${encodeURIComponent(password)}&_t=${Date.now()}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save config';
    console.error('Error saving config:', err);
    return { error: message };
  }
}

export default function Config() {
  const [configData, setConfigData] = useState<ConfigData | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await fetchConfig();
    if (result.error) {
      setError(result.error);
    } else if (result.config) {
      setConfigData(result.config);
      const initialValues: Record<string, string> = {};
      for (const [key, setting] of Object.entries(result.config)) {
        initialValues[key] = setting.value;
      }
      setValues(initialValues);
      setHasChanges(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  function handleChange(key: string, newValue: string) {
    setValues((prev) => ({ ...prev, [key]: newValue }));
    setHasChanges(true);
  }

  async function handleSave() {
    if (!hasChanges) return;
    setSaving(true);
    setError('');
    setSuccess('');
    const result = await saveConfig(values);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Configuration saved successfully! Page will refresh...');
      setHasChanges(false);
      setTimeout(() => window.location.reload(), 1500);
    }
    setSaving(false);
  }

  function handleReset() {
    setHasChanges(false);
    setError('');
    setSuccess('');
    loadConfig();
  }

  if (loading) {
    return (
      <div className="settings-page">
        <header className="page-header">
          <h1>Site Configuration</h1>
          <p className="subtitle">Manage site-wide configuration settings</p>
        </header>
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (!configData) {
    return (
      <div className="settings-page">
        <header className="page-header">
          <h1>Site Configuration</h1>
        </header>
        <div className="error-banner">{error || 'Failed to load configuration'}</div>
        <button className="btn btn-ghost" onClick={loadConfig}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <header className="page-header">
        <h1>Site Configuration</h1>
        <p className="subtitle">
          Configure site-wide settings. Changes only take effect after clicking Save.
        </p>
      </header>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      <div className="config-grid">
        {CONFIG_SECTIONS.map((section) => (
          <div key={section.title} className="card config-section">
            <h2 className="config-section-title">
              <span className="config-section-icon">{section.icon}</span>
              {section.title}
            </h2>
            <div className="config-section-fields">
              {section.keys.map((key) => {
                const setting = configData[key];
                if (!setting) return null;
                return (
                  <ConfigField
                    key={key}
                    keyName={key}
                    label={CONFIG_LABELS[key] || key}
                    setting={setting}
                    value={values[key] ?? setting.value}
                    onChange={handleChange}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="config-sticky-bar">
        <div className="config-sticky-inner">
          <div className="config-sticky-info">
            {hasChanges ? (
              <span className="config-unsaved-badge">⚠️ Unsaved changes</span>
            ) : (
              <span className="config-saved-badge">✓ All saved</span>
            )}
          </div>
          <div className="config-sticky-actions">
            <button
              className="btn btn-ghost btn-lg"
              onClick={handleReset}
              disabled={saving}
            >
              Refresh
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSave}
              disabled={saving || !hasChanges}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
