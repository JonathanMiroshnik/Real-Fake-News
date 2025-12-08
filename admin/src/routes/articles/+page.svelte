<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { getApiBaseUrl } from '$lib/apiConfig';
	import Pagination from '$lib/components/Pagination.svelte';
	import ArticleTable from '$lib/components/ArticleTable.svelte';

	interface Article {
		key?: string;
		title?: string;
		category?: string;
		timestamp?: string;
	}

	let articles = $state<Article[]>([]);
	let loading = $state(false);
	let error = $state('');
	let password = $state('');
	let currentPage = $state(1);
	let itemsPerPage = $state(10);

	const ADMIN_PASSWORD_PARAM = 'pwd';

	// API base URL (without /api prefix) - determined by VITE_BACKEND_DEV_MODE
	const API_BASE = getApiBaseUrl();
	// Frontend dev mode for other frontend-specific behavior (like default password)
	const isFrontendDevMode = import.meta.env.VITE_FRONTEND_DEV_MODE === 'true' || 
	                          import.meta.env.VITE_LOCAL_DEV_MODE === 'true'; // Backward compatibility

	// Fetch articles
	async function fetchArticles() {
		console.log('fetchArticles called', { password, browser, API_BASE });
		if (!password || !browser) {
			console.log('Early return:', { password: !!password, browser });
			return;
		}
		
		loading = true;
		error = '';
		try {
			// Add cache-busting parameter to prevent 304 responses
			const url = `${API_BASE}/api/admin/articles?password=${encodeURIComponent(password)}&_t=${Date.now()}`;
			console.log('Fetching from URL:', url);
			const response = await fetch(url, {
				cache: 'no-store'
			});
			
			console.log('Response received:', { status: response.status, ok: response.ok, headers: Object.fromEntries(response.headers.entries()) });
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch articles`);
			}
			
			// Handle 304 Not Modified (no body)
			if (response.status === 304) {
				console.log('Response cached (304), using existing articles');
				return;
			}
			
			const data = await response.json();
			console.log('Response data:', { success: data.success, articlesCount: data.articles?.length, error: data.error });
			articles = data.articles || [];
			console.log('Articles set:', articles.length, 'articles');
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
			console.log('fetchArticles completed', { loading, articlesCount: articles.length, error });
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
			const url = `${API_BASE}/api/admin/articles/${key}?password=${encodeURIComponent(password)}`;
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


	// Pagination calculations
	const totalPages = $derived(Math.ceil(articles.length / itemsPerPage));
	const startIndex = $derived((currentPage - 1) * itemsPerPage);
	const endIndex = $derived(startIndex + itemsPerPage);
	const paginatedArticles = $derived(articles.slice(startIndex, endIndex));

	// Debug reactive values
	$effect(() => {
		console.log('Articles state changed:', {
			articlesCount: articles.length,
			currentPage,
			totalPages,
			startIndex,
			endIndex,
			paginatedArticlesCount: paginatedArticles.length,
			itemsPerPage
		});
	});

	// Reset to page 1 when articles change or items per page changes
	$effect(() => {
		if (articles.length > 0 && currentPage > totalPages) {
			console.log('Resetting to page 1 because currentPage > totalPages');
			currentPage = 1;
		}
	});

	function handleItemsPerPageChange() {
		currentPage = 1;
	}

	// Reactive password from URL changes
	$effect(() => {
		if (browser) {
			const urlPassword = $page.url.searchParams.get(ADMIN_PASSWORD_PARAM);
			if (urlPassword !== null) {
				password = urlPassword;
			} else {
				// In frontend development mode, use default password; in production, require URL parameter
				password = isFrontendDevMode ? 'changeme123' : '';
			}
		}
	});

	onMount(() => {
		console.log('onMount called', { browser });
		if (!browser) return;
		const urlPassword = $page.url.searchParams.get(ADMIN_PASSWORD_PARAM);
		if (urlPassword !== null) {
			password = urlPassword;
		} else {
			// In frontend development mode, use default password; in production, require URL parameter
			password = isFrontendDevMode ? 'changeme123' : '';
		}
		console.log('Password set:', password ? '***' : 'empty');
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
			<div class="pagination-controls-top">
				<div class="items-per-page">
					<label for="items-per-page-select">Items per page:</label>
					<select 
						id="items-per-page-select"
						bind:value={itemsPerPage}
						onchange={handleItemsPerPageChange}
					>
						<option value={10}>10</option>
						<option value={25}>25</option>
						<option value={50}>50</option>
						<option value={100}>100</option>
					</select>
				</div>
				<div class="pagination-info">
					Showing {startIndex + 1}-{Math.min(endIndex, articles.length)} of {articles.length} articles
				</div>
			</div>
			<ArticleTable 
				articles={paginatedArticles} 
				{loading} 
				onDelete={deleteArticle}
				{startIndex}
			/>
			<Pagination bind:currentPage totalPages={totalPages} />
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

	.pagination-controls-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e0e0e0;
	}

	.items-per-page {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.items-per-page label {
		font-weight: 500;
		color: #2c3e50;
		font-size: 0.9rem;
	}

	.items-per-page select {
		padding: 0.5rem 0.75rem;
		border: 2px solid #e0e0e0;
		border-radius: 6px;
		background: white;
		color: #2c3e50;
		font-size: 0.9rem;
		cursor: pointer;
		transition: border-color 0.2s;
	}

	.items-per-page select:hover {
		border-color: #667eea;
	}

	.items-per-page select:focus {
		outline: none;
		border-color: #667eea;
	}

	.pagination-info {
		color: #7f8c8d;
		font-size: 0.9rem;
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

		.pagination-controls-top {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}
	}
</style>

