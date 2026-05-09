import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  fetchArticles,
  deleteArticle,
  fetchTexts,
  addText,
  generateArticle,
  generateRecipe,
} from '../api/adminApi';
import type { Article } from '../api/adminApi';
import ArticleTable from '../components/ArticleTable';
import Pagination from '../components/Pagination';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [articles, setArticles] = useState<Article[]>([]);
  const [texts, setTexts] = useState<string[]>([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [generatingArticle, setGeneratingArticle] = useState(false);
  const [generatingRecipe, setGeneratingRecipe] = useState(false);

  const password = searchParams.get('pwd') || '';

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await fetchArticles();
    if (result.error) setError(result.error);
    setArticles(result.articles);
    setLoading(false);
  }, []);

  const loadTexts = useCallback(async () => {
    const result = await fetchTexts();
    setTexts(result);
  }, []);

  useEffect(() => {
    loadArticles();
    loadTexts();
  }, [loadArticles, loadTexts]);

  async function handleDelete(key: string | undefined) {
    if (!key) return;
    if (!confirm('Are you sure you want to delete this article?')) return;
    setLoading(true);
    setError('');
    const err = await deleteArticle(key);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      await loadArticles();
    }
  }

  function handleEdit(key: string | undefined) {
    if (!key) return;
    navigate(`/articles/edit/${key}${password ? `?pwd=${encodeURIComponent(password)}` : ''}`);
  }

  async function handleAddText() {
    if (!newText.trim()) return;
    setLoading(true);
    setError('');
    const result = await addText(newText.trim());
    if (result.error) {
      setError(result.error);
    } else {
      setTexts(result.texts);
      setNewText('');
    }
    setLoading(false);
  }

  async function handleGenerateArticle() {
    setGeneratingArticle(true);
    setError('');
    const err = await generateArticle();
    if (err) {
      setError(err);
    } else {
      await loadArticles();
      alert('Article generated successfully!');
    }
    setGeneratingArticle(false);
  }

  async function handleGenerateRecipe() {
    setGeneratingRecipe(true);
    setError('');
    const err = await generateRecipe();
    if (err) {
      setError(err);
    } else {
      alert('Recipe generated successfully!');
    }
    setGeneratingRecipe(false);
  }

  const totalPages = Math.ceil(articles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedArticles = articles.slice(startIndex, endIndex);

  useEffect(() => {
    if (articles.length > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [articles.length, currentPage, totalPages]);

  const isAuthorized = password !== '';

  if (!isAuthorized) {
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
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        {error && <div className="error-banner">{error}</div>}
      </header>

      <div className="sections">
        <section className="card">
          <h2>Content Generation</h2>
          <div className="generation-buttons">
            <button
              className="btn btn-lg btn-primary"
              onClick={handleGenerateArticle}
              disabled={generatingArticle || loading}
            >
              {generatingArticle ? 'Generating...' : '📰 Generate Article'}
            </button>
            <button
              className="btn btn-lg btn-warning"
              onClick={handleGenerateRecipe}
              disabled={generatingRecipe || loading}
            >
              {generatingRecipe ? 'Generating...' : '🍳 Generate Recipe'}
            </button>
          </div>
          <p className="generation-hint">
            Generate a new article from recent news or a new recipe from random foods.
          </p>
        </section>

        <section className="card">
          <h2>Article Management</h2>
          {loading && articles.length === 0 ? (
            <div className="loading">Loading articles...</div>
          ) : articles.length === 0 ? (
            <div className="empty">No articles found</div>
          ) : (
            <>
              <div className="pagination-controls-top">
                <div className="items-per-page">
                  <label htmlFor="items-per-page">Items per page:</label>
                  <select
                    id="items-per-page"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div className="pagination-info">
                  Showing {startIndex + 1}-{Math.min(endIndex, articles.length)} of{' '}
                  {articles.length} articles
                </div>
              </div>
              <ArticleTable
                articles={paginatedArticles}
                loading={loading}
                onDelete={handleDelete}
                onEdit={handleEdit}
                startIndex={startIndex}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </section>

        <section className="card">
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
            {texts.length === 0 ? (
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
        </section>
      </div>
    </div>
  );
}
