<script lang="ts">
	import { getClientUrl } from '$lib/apiConfig';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	interface Article {
		key?: string;
		title?: string;
		category?: string;
		timestamp?: string;
		writerType?: "AI" | "Human" | "Synthesis";
		isFeatured?: boolean;
		featuredDate?: string;
		_index?: number;
	}

	interface Props {
		articles: Article[];
		loading: boolean;
		onDelete: (key: string | undefined) => void;
		startIndex: number;
	}

	let { articles, loading, onDelete, startIndex }: Props = $props();

	// Get password from URL for navigation
	const password = $derived($page.url.searchParams.get('pwd') || '');

	function handleEdit(key: string | undefined) {
		if (!key) return;
		const passwordParam = password ? `?pwd=${encodeURIComponent(password)}` : '';
		goto(`${base}/articles/edit/${key}${passwordParam}`);
	}

	// Get article URL
	function getArticleUrl(key: string | undefined): string {
		if (!key) return '#';
		const clientUrl = getClientUrl();
		return `${clientUrl}/article/${key}`;
	}

	// Format date
	function formatDate(timestamp: string | undefined): string {
		if (!timestamp) return 'N/A';
		try {
			const date = new Date(timestamp);
			return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
		} catch {
			return timestamp;
		}
	}

	// Check if article is featured today
	function isFeaturedToday(article: Article): boolean {
		if (!article.isFeatured || !article.featuredDate) return false;
		const today = new Date().toISOString().split('T')[0];
		return article.featuredDate === today;
	}
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th>Title</th>
				<th>Category</th>
				<th>Writer Type</th>
				<th>Date</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each articles.map((article, index) => ({ ...article, _index: startIndex + index })) as article (article.key ? article.key : `article-${article._index}`)}
				<tr>
					<td>
						<div class="title-cell">
							<a href={getArticleUrl(article.key)} target="_blank" rel="noopener noreferrer" class="article-link">
								{article.title || 'Untitled'}
							</a>
							{#if isFeaturedToday(article)}
								<span class="featured-badge" title="Featured Article Today">⭐</span>
							{/if}
						</div>
					</td>
					<td>
						<span class="category-badge">{article.category || 'Uncategorized'}</span>
					</td>
					<td>
						<span class="writer-type-badge" data-type={article.writerType || 'AI'}>
							{article.writerType || 'AI'}
						</span>
					</td>
					<td class="date-cell">{formatDate(article.timestamp)}</td>
					<td>
						<div class="action-buttons">
							<button 
								class="edit-btn" 
								onclick={() => handleEdit(article.key)}
								disabled={loading}
							>
								✏️ Edit
							</button>
							<button 
								class="delete-btn" 
								onclick={() => onDelete(article.key)}
								disabled={loading}
							>
								🗑️ Delete
							</button>
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.table-container {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	thead {
		background: #f8f9fa;
	}

	th {
		padding: 1rem;
		text-align: left;
		font-weight: 600;
		color: #2c3e50;
		border-bottom: 2px solid #e0e0e0;
	}

	td {
		padding: 1rem;
		border-bottom: 1px solid #f0f0f0;
	}

	tbody tr:hover {
		background: #f8f9fa;
	}

	tbody tr:last-child td {
		border-bottom: none;
	}

	.article-link {
		color: #667eea;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
	}

	.article-link:hover {
		color: #764ba2;
		text-decoration: underline;
	}

	.title-cell {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.featured-badge {
		background: #ffc107;
		color: #2c3e50;
		padding: 0.2rem 0.5rem;
		border-radius: 12px;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: help;
	}

	.category-badge {
		background: #e9ecef;
		color: #495057;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.85rem;
		font-weight: 500;
	}

	.writer-type-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.85rem;
		font-weight: 500;
		text-transform: uppercase;
	}

	.writer-type-badge[data-type="AI"] {
		background: #e3f2fd;
		color: #1976d2;
	}

	.writer-type-badge[data-type="Human"] {
		background: #f3e5f5;
		color: #7b1fa2;
	}

	.writer-type-badge[data-type="Synthesis"] {
		background: #fff3e0;
		color: #e65100;
	}

	.date-cell {
		color: #7f8c8d;
		font-size: 0.9rem;
	}

	.action-buttons {
		display: flex;
		gap: 0.5rem;
	}

	.edit-btn {
		background: #667eea;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		font-size: 0.9rem;
		transition: background 0.2s, transform 0.1s;
	}

	.edit-btn:hover:not(:disabled) {
		background: #5568d3;
		transform: translateY(-1px);
	}

	.edit-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.delete-btn {
		background: #ff4444;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		font-size: 0.9rem;
		transition: background 0.2s, transform 0.1s;
	}

	.delete-btn:hover:not(:disabled) {
		background: #cc0000;
		transform: translateY(-1px);
	}

	.delete-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		table {
			font-size: 0.9rem;
		}

		th, td {
			padding: 0.75rem 0.5rem;
		}
	}
</style>

