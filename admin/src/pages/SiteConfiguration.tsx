import { useState, useEffect, useCallback } from 'react';
import { fetchConfig, saveConfig } from '../api/adminApi';
import type { SiteConfigEntry } from '../api/adminApi';

interface ConfigFieldProps {
  keyName: string;
  label: string;
  setting: SiteConfigEntry;
  value: string;
  onChange: (key: string, value: string) => void;
}

interface ConfigSection {
  title: string;
  icon: string;
  keys: string[];
}

function ConfigField({ keyName, label, setting, value, onChange }: ConfigFieldProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipTimer, setTooltipTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseEnter() {
    const timer = setTimeout(() => setShowTooltip(true), 400);
    setTooltipTimer(timer);
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
            {showTooltip && <span className="config-tooltip">{setting.description}</span>}
          </span>
        </div>
        {setting.type === 'boolean' ? (
          <label className="config-checkbox-label">
            <input
              id={fieldId}
              type="checkbox"
              checked={value === 'true'}
              onChange={(e) => onChange(keyName, e.target.checked ? 'true' : 'false')}
            />
            <span className="checkbox-custom"></span>
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

const FIELD_LABELS: Record<string, string> = {
  articlesPerDay: 'Articles to generate per day',
  recipesPerDay: 'Recipes to generate per day',
  articleGenerationIntervalHours: 'Article generation interval (hours)',
  newsFetchIntervalHours: 'News fetching interval (hours)',
  minAcceptableArticles: 'Minimum acceptable articles before fallback',
  enableScheduledJobs: 'Enable scheduled jobs',
};

const CONFIG_SECTIONS: ConfigSection[] = [
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

export default function SiteConfiguration() {
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [configMeta, setConfigMeta] = useState<Record<string, SiteConfigEntry> | null>(null);
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
      setConfigMeta(result.config);
      const values: Record<string, string> = {};
      for (const [key, entry] of Object.entries(result.config)) {
        values[key] = entry.value;
      }
      setConfigValues(values);
      setHasChanges(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  function handleChange(key: string, value: string) {
    setConfigValues((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }

  async function handleSave() {
    if (!hasChanges) return;
    setSaving(true);
    setError('');
    setSuccess('');

    const result = await saveConfig(configValues);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Configuration saved successfully! Page will refresh...');
      setHasChanges(false);
      setTimeout(() => window.location.reload(), 1500);
    }
    setSaving(false);
  }

  function handleRefresh() {
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
          <div className="spinner"></div>
          <p>Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (!configMeta) {
    return (
      <div className="settings-page">
        <header className="page-header">
          <h1>Site Configuration</h1>
        </header>
        <div className="error-banner">{error || 'Failed to load configuration'}</div>
        <button className="btn btn-ghost" onClick={handleRefresh}>
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
                const setting = configMeta[key];
                if (!setting) return null;
                return (
                  <ConfigField
                    key={key}
                    keyName={key}
                    label={FIELD_LABELS[key] || key}
                    setting={setting}
                    value={configValues[key] ?? setting.value}
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
              <span className="config-unsaved-badge">\u26a0\ufe0f Unsaved changes</span>
            ) : (
              <span className="config-saved-badge">\u2713 All saved</span>
            )}
          </div>
          <div className="config-sticky-actions">
            <button className="btn btn-ghost btn-lg" onClick={handleRefresh} disabled={saving}>
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
