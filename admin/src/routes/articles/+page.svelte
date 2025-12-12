<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { getApiBaseUrlWithPrefix } from '$lib/apiConfig';
	import Pagination from '$lib/components/Pagination.svelte';
	import ArticleTable from '$lib/components/ArticleTable.svelte';

	interface Article {
		key?: string;
		title?: string;
		category?: string;
		timestamp?: string;
		writerType?: "AI" | "Human" | "Synthesis";
	}

	// Store articles by page number
	let articlesByPage = $state<Map<number, Article[]>>(new Map());
	let totalCount = $state(0);
	let loading = $state(false);
	let error = $state('');
	let password = $state('');
	let currentPage = $state(1);
	let itemsPerPage = $state(10);
	
	// Track which pages have been fetched
	let fetchedPages = $state<Set<number>>(new Set());
	
	// Page buffer size - how many pages to fetch around the current page
	// This can be configured via env variable, defaulting to 2
	const PAGE_BUFFER_SIZE = parseInt(import.meta.env.VITE_ADMIN_PAGE_BUFFER_SIZE || '2', 10);

	const ADMIN_PASSWORD_PARAM = 'pwd';

	// API base URL (with /api prefix) - determined by VITE_BACKEND_DEV_MODE
	const API_BASE = getApiBaseUrlWithPrefix();
	// Frontend dev mode for other frontend-specific behavior (like default password)
	const isFrontendDevMode = import.meta.env.VITE_FRONTEND_DEV_MODE === 'true' || 
	                          import.meta.env.VITE_LOCAL_DEV_MODE === 'true'; // Backward compatibility

	// Fetch total count of articles
	async function fetchTotalCount(): Promise<number> {
		if (!password || !browser) return 0;
		
		try {
			const url = `${API_BASE}/admin/articles/count?password=${encodeURIComponent(password)}`;
			const response = await fetch(url, { cache: 'no-store' });
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch count`);
			}
			
			const data = await response.json();
			return data.totalCount || 0;
		} catch (err) {
			console.error('Error fetching total count:', err);
			return 0;
		}
	}

	// Fetch specific page(s) of articles
	async function fetchPages(pageNumbers: number[]): Promise<void> {
		if (!password || !browser || pageNumbers.length === 0) return;
		
		// Filter out pages that are already fetched
		const pagesToFetch = pageNumbers.filter(pageNum => !fetchedPages.has(pageNum));
		if (pagesToFetch.length === 0) return;
		
		loading = true;
		error = '';
		try {
			// Fetch multiple pages at once using comma-separated pages parameter
			const pagesParam = pagesToFetch.join(',');
			const url = `${API_BASE}/admin/articles?password=${encodeURIComponent(password)}&pages=${pagesParam}&itemsPerPage=${itemsPerPage}&_t=${Date.now()}`;
			console.log('Fetching pages:', pagesToFetch, 'from URL:', url);
			
			const response = await fetch(url, {
				cache: 'no-store'
			});
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch articles`);
			}
			
			const data = await response.json();
			// Sort articles by date (most recent first) before distributing to pages
			const fetchedArticles: Article[] = (data.articles || []).sort((a: Article, b: Article) => {
				const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
				const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
				return dateB - dateA; // Descending order (most recent first)
			});
			
			// Distribute articles to their respective pages
			// The server returns articles in page order (page 1, then page 2, etc.)
			// So we split them sequentially
			const sortedPages = [...pagesToFetch].sort((a, b) => a - b);
			let articleIndex = 0;
			
			for (const pageNum of sortedPages) {
				const pageArticles = fetchedArticles.slice(articleIndex, articleIndex + itemsPerPage);
				
				if (pageArticles.length > 0) {
					articlesByPage.set(pageNum, pageArticles);
					fetchedPages.add(pageNum);
					articleIndex += pageArticles.length;
				} else {
					// If we run out of articles, mark the page as fetched (empty)
					articlesByPage.set(pageNum, []);
					fetchedPages.add(pageNum);
				}
			}
			
			console.log('Fetched pages:', pagesToFetch, 'articles:', fetchedArticles.length);
		} catch (err) {
			console.error('Error fetching pages:', err);
			if (err instanceof TypeError && err.message.includes('fetch')) {
				error = 'Network error: Is the backend server running on ' + API_BASE + '?';
			} else {
				error = err instanceof Error ? err.message : 'An error occurred';
			}
		} finally {
			loading = false;
		}
	}

	// Get articles for current page (from cache or fetch if needed)
	async function ensurePageFetched(pageNum: number): Promise<void> {
		if (fetchedPages.has(pageNum)) {
			return; // Already fetched
		}
		
		// Calculate which pages to fetch (current page + buffer)
		const pagesToFetch: number[] = [];
		const startPage = Math.max(1, pageNum - PAGE_BUFFER_SIZE);
		const endPage = Math.min(totalPages, pageNum + PAGE_BUFFER_SIZE);
		
		for (let p = startPage; p <= endPage; p++) {
			if (!fetchedPages.has(p)) {
				pagesToFetch.push(p);
			}
		}
		
		if (pagesToFetch.length > 0) {
			await fetchPages(pagesToFetch);
		}
	}

	// Handle page change
	async function handlePageChange(pageNum: number) {
		currentPage = pageNum;
		await ensurePageFetched(pageNum);
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
			
			// Invalidate cache and refresh
			articlesByPage = new Map();
			fetchedPages = new Set();
			totalCount = await fetchTotalCount();
			await ensurePageFetched(currentPage);
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

	// Refresh all data
	async function refreshArticles() {
		articlesByPage = new Map();
		fetchedPages = new Set();
		totalCount = await fetchTotalCount();
		await ensurePageFetched(currentPage);
	}

	// Pagination calculations
	const totalPages = $derived(Math.ceil(totalCount / itemsPerPage));
	const paginatedArticles = $derived(articlesByPage.get(currentPage) || []);
	const startIndex = $derived((currentPage - 1) * itemsPerPage);

	// Watch for page changes and fetch if needed
	$effect(() => {
		if (totalCount > 0 && currentPage >= 1 && currentPage <= totalPages) {
			ensurePageFetched(currentPage);
		}
	});

	// Watch for itemsPerPage changes - reset cache
	$effect(() => {
		if (itemsPerPage > 0) {
			articlesByPage = new Map();
			fetchedPages = new Set();
			if (totalCount > 0) {
				ensurePageFetched(currentPage);
			}
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

	onMount(async () => {
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
		
		// Fetch total count first, then fetch initial page
		totalCount = await fetchTotalCount();
		if (totalCount > 0) {
			await ensurePageFetched(currentPage);
		}
	});
</script>

<svelte:head>
	<title>Articles - Admin Panel</title>
</svelte:head>

<div class="articles-page">
	<header class="page-header">
		<h1>Article Management</h1>
		<button class="refresh-btn" onclick={refreshArticles} disabled={loading}>
			🔄 Refresh
		</button>
	</header>

	{#if error}
		<div class="error-banner">{error}</div>
	{/if}

	<div class="content-card">
		{#if loading && totalCount === 0 && paginatedArticles.length === 0}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>Loading articles...</p>
			</div>
		{:else if totalCount === 0}
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
					Showing {startIndex + 1}-{Math.min(startIndex + paginatedArticles.length, totalCount)} of {totalCount} articles
				</div>
			</div>
			{#if loading && paginatedArticles.length === 0}
				<div class="loading-state">
					<div class="spinner"></div>
					<p>Loading page {currentPage}...</p>
				</div>
			{:else}
				<ArticleTable 
					articles={paginatedArticles} 
					{loading} 
					onDelete={deleteArticle}
					{startIndex}
				/>
			{/if}
			<Pagination bind:currentPage totalPages={totalPages} onPageChange={handlePageChange} />
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


