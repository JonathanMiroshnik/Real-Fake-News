import { Article, getArticleUrl } from '../api/adminApi';

interface ArticleTableProps {
  articles: Article[];
  loading: boolean;
  onDelete: (key: string | undefined) => void;
  onEdit: (key: string | undefined) => void;
  startIndex: number;
}

function formatDate(timestamp: string | undefined): string {
  if (!timestamp) return 'N/A';
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  } catch {
    return timestamp;
  }
}

function isFeaturedToday(article: Article): boolean {
  if (!article.isFeatured || !article.featuredDate) return false;
  const today = new Date().toISOString().split('T')[0];
  return article.featuredDate === today;
}

export default function ArticleTable({ articles, loading, onDelete, onEdit, startIndex }: ArticleTableProps) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Category</th>
            <th>Writer Type</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article, index) => (
            <tr key={article.key || `article-${startIndex + index}`}>
              <td className="row-number">{startIndex + index + 1}</td>
              <td>
                <div className="title-cell">
                  <a
                    href={getArticleUrl(article.key)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="article-link"
                  >
                    {article.title || 'Untitled'}
                  </a>
                  {isFeaturedToday(article) && (
                    <span className="badge badge-featured" title="Featured Article Today">⭐</span>
                  )}
                </div>
              </td>
              <td>
                <span className="badge badge-category">{article.category || 'Uncategorized'}</span>
              </td>
              <td>
                <span className={`badge badge-writer-${(article.writerType || 'AI').toLowerCase()}`}>
                  {article.writerType || 'AI'}
                </span>
              </td>
              <td className="date-cell">{formatDate(article.timestamp)}</td>
              <td>
                <div className="action-buttons">
                  <button className="btn btn-sm btn-primary" onClick={() => onEdit(article.key)} disabled={loading}>
                    ✏️ Edit
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => onDelete(article.key)} disabled={loading}>
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

