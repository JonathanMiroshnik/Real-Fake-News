import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  fetchArticle,
  updateArticle,
  setFeaturedArticle,
  deleteArticle,
  uploadImage,
  getArticleUrl,
  VALID_CATEGORIES,
} from '../api/adminApi';
import type { Article } from '../api/adminApi';

export default function ArticleEditor() {
  const { key } = useParams<{ key: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const password = searchParams.get('pwd') || '';

  const [article, setArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [category, setCategory] = useState('');
  const [writerType, setWriterType] = useState<'AI' | 'Human' | 'Synthesis'>('AI');
  const [headImage, setHeadImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState('');

  useEffect(() => {
    if (!key) return;
    async function load() {
      setLoading(true);
      setError('');
      const result = await fetchArticle(key!);
      if (result.error) {
        setError(result.error);
      } else if (result.article) {
        setArticle(result.article);
        setTitle(result.article.title || '');
        setContent(result.article.content || '');
        setShortDescription(result.article.shortDescription || '');
        setCategory(result.article.category || '');
        setWriterType(result.article.writerType || 'AI');
        setHeadImage(result.article.headImage || '');
      }
      setLoading(false);
    }
    load();
  }, [key]);

  function resetForm() {
    if (!article) return;
    setTitle(article.title || '');
    setContent(article.content || '');
    setShortDescription(article.shortDescription || '');
    setCategory(article.category || '');
    setWriterType(article.writerType || 'AI');
    setHeadImage(article.headImage || '');
    setError('');
    setSuccess('');
  }

  async function handleSave() {
    if (!key) return;
    setSaving(true);
    setError('');
    setSuccess('');
    const err = await updateArticle(key, {
      title: title.trim() || undefined,
      content: content.trim() || undefined,
      shortDescription: shortDescription.trim() || undefined,
      category: category || undefined,
      writerType: writerType,
      headImage: headImage || undefined,
    });
    if (err) {
      setError(err);
    } else {
      setSuccess('Article saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
    setSaving(false);
  }

  async function handleSetFeatured() {
    if (!key) return;
    setSaving(true);
    setError('');
    const err = await setFeaturedArticle(key);
    if (err) {
      setError(err);
    } else {
      setSuccess('Article set as featured for today!');
      setTimeout(() => setSuccess(''), 3000);
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!key) return;
    if (!confirm('Are you sure you want to delete this article?')) return;
    setLoading(true);
    const err = await deleteArticle(key);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      const pwdParam = password ? `?pwd=${encodeURIComponent(password)}` : '';
      navigate(`/${pwdParam}`);
    }
  }

  async function handleFileUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError('');
    const result = await uploadImage(file);
    if (result.error) {
      setError(result.error);
    } else if (result.filename) {
      setHeadImage(result.filename);
      setSelectedFile(null);
    }
    setUploading(false);
  }

  function handleManualImageAdd() {
    if (!manualImageUrl.trim()) return;
    setHeadImage(manualImageUrl.trim());
    setManualImageUrl('');
  }

  function formatDate(timestamp: string | undefined): string {
    if (!timestamp) return 'N/A';
    try {
      return (
        new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString()
      );
    } catch {
      return timestamp;
    }
  }

  if (loading && !article) {
    return <div className="loading">Loading article...</div>;
  }

  if (error && !article) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="edit-page">
      <header className="page-header">
        <h1>Edit Article</h1>
        <div className="header-actions">
          <button
            className="btn btn-ghost"
            onClick={() => navigate('/' + (password ? `?pwd=${encodeURIComponent(password)}` : ''))}
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      <div className="article-info">
        <div className="info-row">
          <span className="info-label">Key:</span>
          <code>{key}</code>
        </div>
        <div className="info-row">
          <span className="info-label">Created:</span>
          <span>{formatDate(article?.timestamp)}</span>
        </div>
        <div className="info-row">
          <span className="info-label">View:</span>
          <a
            href={getArticleUrl(key)}
            target="_blank"
            rel="noopener noreferrer"
            className="view-link"
          >
            Open Article ↗
          </a>
        </div>
      </div>

      <div className="content-card">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select category...</option>
              {VALID_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="writerType">Writer Type</label>
            <select
              id="writerType"
              value={writerType}
              onChange={(e) => setWriterType(e.target.value as 'AI' | 'Human' | 'Synthesis')}
            >
              <option value="AI">AI</option>
              <option value="Human">Human</option>
              <option value="Synthesis">Synthesis</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="shortDescription">Short Description</label>
          <textarea
            id="shortDescription"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Brief description of the article"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content (Markdown)</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Article content in markdown..."
            rows={15}
          />
        </div>

        <div className="form-group">
          <label>Head Image</label>
          <div className="image-section">
            <div className="upload-section">
              <label className="upload-label">
                <span className="btn btn-ghost">📁 Choose File</span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                />
              </label>
              {selectedFile && (
                <div className="file-info">
                  <p>
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleFileUpload(selectedFile)}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              )}
            </div>

            <div className="manual-input-section">
              <label className="manual-label">Or enter image URL manually:</label>
              <div className="text-input-container">
                <input
                  type="text"
                  value={manualImageUrl}
                  onChange={(e) => setManualImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  className="btn btn-primary"
                  onClick={handleManualImageAdd}
                  disabled={!manualImageUrl.trim()}
                >
                  Set
                </button>
              </div>
            </div>
          </div>

          {headImage && (
            <div className="image-preview">
              <p className="preview-label">
                Current Image: <code>{headImage}</code>
              </p>
              <img
                src={headImage.startsWith('http') ? headImage : `/api/images/${headImage}`}
                alt="Preview"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
          <button className="btn btn-warning" onClick={handleSetFeatured} disabled={saving}>
            ⭐ Set as Featured
          </button>
          <button className="btn btn-ghost" onClick={resetForm} disabled={saving}>
            ↩️ Reset
          </button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
            🗑️ Delete Article
          </button>
        </div>
      </div>
    </div>
  );
}
