<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	interface Article {
		key?: string;
		title?: string;
		category?: string;
		timestamp?: string;
	}

	let articles: Article[] = [];
	let loading = false;
	let error = '';
	let password = '';

	const ADMIN_PASSWORD_PARAM = 'pwd';

	// API base URL
	const isDevMode = import.meta.env.VITE_LOCAL_DEV_MODE === 'true';
	const API_BASE = isDevMode
		? (import.meta.env.VITE_API_BASE_DEV || 'http://localhost:5001/api')
		: (import.meta.env.VITE_API_BASE_PROD || 'https://real.sensorcensor.xyz/api');

	// Fetch articles
	async function fetchArticles() {
		if (!password || !browser) return;
		
		loading = true;
		error = '';
		try {
			const url = `${API_BASE}/admin/articles?password=${encodeURIComponent(password)}`;
			const response = await fetch(url);
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch articles`);
			}
			
			const data = await response.json();
			articles = data.articles || [];
		} catch (err) {
			console.error('Error fetching articles:', err);
			if (err instanceof TypeError && err.message.includes('fetch')) {
				error = 'Network error: Is the backend server running on ' + API_BASE + '?';
			} else {
				error = err instanceof Error ? err.message : 'An error occurred';
			}
			articles = [];
		} finally {
			loading = false;
		}
	}

	// Delete article
	async function deleteArticle(key: string | undefined) {
		if (!key || !password || !browser) return;
		
		if (!confirm('Are you sure you want to delete this article?')) {
			return;
		}

		loading = true;
		error = '';
		try {
			const url = `${API_BASE}/admin/articles/${key}?password=${encodeURIComponent(password)}`;
			const response = await fetch(url, {
				method: 'DELETE'
			});
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || `HTTP ${response.status}: Failed to delete article`);
			}
			
			// Refresh articles list
			await fetchArticles();
		} catch (err) {
			console.error('Error deleting article:', err);
			if (err instanceof TypeError && err.message.includes('fetch')) {
				error = 'Network error: Is the backend server running on ' + API_BASE + '?';
			} else {
				error = err instanceof Error ? err.message : 'Failed to delete article';
			}
		} finally {
			loading = false;
		}
	}

	// Get article URL
	function getArticleUrl(key: string | undefined): string {
		if (!key) return '#';
		const clientUrl = isDevMode 
			? (import.meta.env.VITE_CLIENT_URL_DEV || 'http://localhost:5173')
			: (import.meta.env.VITE_CLIENT_URL_PROD || 'https://real.sensorcensor.xyz');
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

	onMount(() => {
		if (!browser) return;
		const urlPassword = $page.url.searchParams.get(ADMIN_PASSWORD_PARAM);
		password = urlPassword || 'debug';
		fetchArticles();
	});
</script>

<svelte:head>
	<title>Articles - Admin Panel</title>
</svelte:head>

<div class="articles-page">
	<header class="page-header">
		<h1>Article Management</h1>
		<button class="refresh-btn" onclick={fetchArticles} disabled={loading}>
			🔄 Refresh
		</button>
	</header>

	{#if error}
		<div class="error-banner">{error}</div>
	{/if}

	<div class="content-card">
		{#if loading && articles.length === 0}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>Loading articles...</p>
			</div>
		{:else if articles.length === 0}
			<div class="empty-state">
				<p>No articles found</p>
			</div>
		{:else}
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>Title</th>
							<th>Category</th>
							<th>Date</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each articles.map((article, index) => ({ ...article, _index: index })) as article (article.key ? article.key : `article-${article._index}`)}
							<tr>
								<td>
									<a href={getArticleUrl(article.key)} target="_blank" rel="noopener noreferrer" class="article-link">
										{article.title || 'Untitled'}
									</a>
								</td>
								<td>
									<span class="category-badge">{article.category || 'Uncategorized'}</span>
								</td>
								<td class="date-cell">{formatDate(article.timestamp)}</td>
								<td>
									<button 
										class="delete-btn" 
										onclick={() => deleteArticle(article.key)}
										disabled={loading}
									>
										🗑️ Delete
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<style>
	.articles-page {
		max-width: 1400px;
		margin: 0 auto;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.page-header h1 {
		font-size: 2.5rem;
		margin: 0;
		color: #2c3e50;
	}

	.refresh-btn {
		background: #667eea;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 500;
		font-size: 1rem;
		transition: background 0.2s;
	}

	.refresh-btn:hover:not(:disabled) {
		background: #5568d3;
	}

	.refresh-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.error-banner {
		background: #ff4444;
		color: white;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 2rem;
		text-align: center;
	}

	.content-card {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.loading-state,
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		color: #7f8c8d;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #e0e0e0;
		border-top-color: #667eea;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

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

	.category-badge {
		background: #e9ecef;
		color: #495057;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.85rem;
		font-weight: 500;
	}

	.date-cell {
		color: #7f8c8d;
		font-size: 0.9rem;
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
		.page-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.page-header h1 {
			font-size: 2rem;
		}

		.content-card {
			padding: 1rem;
		}

		table {
			font-size: 0.9rem;
		}

		th, td {
			padding: 0.75rem 0.5rem;
		}
	}
</style>

