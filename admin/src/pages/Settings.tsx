import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchTexts, addText } from '../api/adminApi';
import { getApiBaseUrlWithPrefix } from '../api/apiConfig';

export default function Settings() {
  const [searchParams] = useSearchParams();
  const [texts, setTexts] = useState<string[]>([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE = getApiBaseUrlWithPrefix();
  const isFrontendDevMode =
    import.meta.env.VITE_FRONTEND_DEV_MODE === 'true' ||
    import.meta.env.VITE_LOCAL_DEV_MODE === 'true';

  const loadTexts = useCallback(async () => {
    const result = await fetchTexts();
    setTexts(result);
  }, []);

  useEffect(() => {
    loadTexts();
  }, [loadTexts]);

  async function handleAddText() {
    if (!newText.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    const result = await addText(newText.trim());
    if (result.error) {
      setError(result.error);
    } else {
      setTexts(result.texts);
      setNewText('');
      setSuccess('Text added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
    setLoading(false);
  }

  return (
    <div className="settings-page">
      <header className="page-header">
        <h1>Settings</h1>
        <p className="subtitle">Manage text items and configuration</p>
      </header>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      <div className="settings-grid">
        <div className="settings-card">
          <h2>Text Management</h2>
          <div className="text-input-container">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddText();
                }
              }}
              placeholder="Enter text to add..."
              disabled={loading}
            />
            <button
              className="btn btn-primary"
              onClick={handleAddText}
              disabled={loading || !newText.trim()}
            >
              Add Text
            </button>
          </div>
          <div className="texts-display">
            {loading && texts.length === 0 ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading texts...</p>
              </div>
            ) : texts.length === 0 ? (
              <p className="empty">No texts added yet</p>
            ) : (
              <ul>
                {texts.map((text, index) => (
                  <li key={index}>
                    <span className="text-number">{index + 1}.</span>
                    <span className="text-content">{text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="settings-card">
          <h2>Configuration</h2>
          <div className="config-info">
            <div className="info-item">
              <label>API Base URL</label>
              <code>{API_BASE}</code>
            </div>
            <div className="info-item">
              <label>Backend Mode</label>
              <code>
                {import.meta.env.VITE_BACKEND_DEV_MODE === 'true' ? 'Development' : 'Production'}
              </code>
            </div>
            <div className="info-item">
              <label>Frontend Mode</label>
              <code>{isFrontendDevMode ? 'Development' : 'Production'}</code>
            </div>
            <div className="info-item">
              <label>Text Items Count</label>
              <code>{texts.length}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
