<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { getApiBaseUrlWithPrefix } from '$lib/apiConfig';
	import Pagination from '$lib/components/Pagination.svelte';
	import ArticleTable from '$lib/components/ArticleTable.svelte';

	// Disable SSR - this page is client-only
	export const ssr = false;

	interface Article {
		key?: string;
		title?: string;
		category?: string;
		timestamp?: string;
	}

	let articles = $state<Article[]>([]);
	let texts = $state<string[]>([]);
	let newText = $state('');
	let loading = $state(false);
	let error = $state('');
	let password = $state('');
	let isAuthorized = $state(false);
	let currentPage = $state(1);
	let itemsPerPage = $state(10);

	// API base URL (with /api prefix) - determined by VITE_BACKEND_DEV_MODE
	const API_BASE = getApiBaseUrlWithPrefix();
	// Frontend dev mode for other frontend-specific behavior (like default password)
	const isFrontendDevMode = import.meta.env.VITE_FRONTEND_DEV_MODE === 'true' || 
	                          import.meta.env.VITE_LOCAL_DEV_MODE === 'true'; // Backward compatibility
	const ADMIN_PASSWORD_PARAM = 'pwd';

	// Password and authorization will be set in onMount (client-side only)

	// Fetch articles
	async function fetchArticles() {
		if (!password || !browser) return;
		
		loading = true;
		error = '';
		try {
			// Add cache-busting parameter to prevent 304 responses
			const url = `${API_BASE}/admin/articles?password=${encodeURIComponent(password)}&_t=${Date.now()}`;
			const response = await fetch(url, {
				cache: 'no-store'
			});
			
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
			// Sort articles by date (most recent first)
			const fetchedArticles = data.articles || [];
			articles = fetchedArticles.sort((a: Article, b: Article) => {
				const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
				const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
				return dateB - dateA; // Descending order (most recent first)
			});
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

	// Fetch texts
	async function fetchTexts() {
		if (!password || !browser) return;
		
		loading = true;
		try {
			const url = `${API_BASE}/admin/texts?password=${encodeURIComponent(password)}`;
			const response = await fetch(url);
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch texts`);
			}
			
			const data = await response.json();
			texts = data.texts || [];
		} catch (err) {
			console.error('Error fetching texts:', err);
			// Don't set error for texts, it's not critical
			texts = [];
		} finally {
			loading = false;
		}
	}

	// Add text
	async function addText() {
		if (!password || !newText.trim() || !browser) return;
		
		loading = true;
		error = '';
		try {
			const url = `${API_BASE}/admin/texts?password=${encodeURIComponent(password)}`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ text: newText.trim() })
			});
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || `HTTP ${response.status}: Failed to add text`);
			}
			
			const data = await response.json();
			texts = data.texts || [];
			newText = '';
		} catch (err) {
			console.error('Error adding text:', err);
			if (err instanceof TypeError && err.message.includes('fetch')) {
				error = 'Network error: Is the backend server running on ' + API_BASE + '?';
			} else {
				error = err instanceof Error ? err.message : 'Failed to add text';
			}
		} finally {
			loading = false;
		}
	}

	// Generate article
	let generatingArticle = $state(false);
	async function generateArticle() {
		if (!password || !browser) return;
		
		generatingArticle = true;
		error = '';
		try {
			const url = `${API_BASE}/admin/generate/article?password=${encodeURIComponent(password)}`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || `HTTP ${response.status}: Failed to generate article`);
			}
			
			const data = await response.json();
			if (data.success) {
				// Refresh articles list
				await fetchArticles();
				error = ''; // Clear any previous errors
				alert('Article generated successfully!');
			} else {
				throw new Error(data.error || 'Failed to generate article');
			}
		} catch (err) {
			console.error('Error generating article:', err);
			if (err instanceof TypeError && err.message.includes('fetch')) {
				error = 'Network error: Is the backend server running on ' + API_BASE + '?';
			} else {
				error = err instanceof Error ? err.message : 'Failed to generate article';
			}
		} finally {
			generatingArticle = false;
		}
	}

	// Generate recipe
	let generatingRecipe = $state(false);
	async function generateRecipe() {
		if (!password || !browser) return;
		
		generatingRecipe = true;
		error = '';
		try {
			const url = `${API_BASE}/admin/generate/recipe?password=${encodeURIComponent(password)}`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || `HTTP ${response.status}: Failed to generate recipe`);
			}
			
			const data = await response.json();
			if (data.success) {
				error = ''; // Clear any previous errors
				alert('Recipe generated successfully!');
			} else {
				throw new Error(data.error || 'Failed to generate recipe');
			}
		} catch (err) {
			console.error('Error generating recipe:', err);
			if (err instanceof TypeError && err.message.includes('fetch')) {
				error = 'Network error: Is the backend server running on ' + API_BASE + '?';
			} else {
				error = err instanceof Error ? err.message : 'Failed to generate recipe';
			}
		} finally {
			generatingRecipe = false;
		}
	}


	// Pagination calculations
	const totalPages = $derived(Math.ceil(articles.length / itemsPerPage));
	const startIndex = $derived((currentPage - 1) * itemsPerPage);
	const endIndex = $derived(startIndex + itemsPerPage);
	const paginatedArticles = $derived(articles.slice(startIndex, endIndex));

	// Reset to page 1 when articles change or items per page changes
	$effect(() => {
		if (articles.length > 0 && currentPage > totalPages) {
			currentPage = 1;
		}
	});

	function handleItemsPerPageChange() {
		currentPage = 1;
	}

	// Load data when authorized (only on client)
	onMount(() => {
		const urlPassword = $page.url.searchParams.get(ADMIN_PASSWORD_PARAM);
		if (urlPassword !== null) {
			password = urlPassword;
		} else {
			// In frontend development mode, use default password; in production, require URL parameter
			if (isFrontendDevMode) {
				password = 'changeme123'; // Default dev password
			} else {
				password = ''; // Require password in production
			}
		}
		isAuthorized = true;
		fetchArticles();
		fetchTexts();
	});
</script>

<svelte:head>
	<title>Admin Panel</title>
</svelte:head>

{#if !isAuthorized}
	<div class="unauthorized">
		<h1>Access Denied</h1>
		<p>This page requires authorization.</p>
	</div>
{:else}
	<div class="admin-panel">
		<header>
			<h1>Admin Panel</h1>
			{#if error}
				<div class="error">{error}</div>
			{/if}
		</header>

		<div class="sections">
			<!-- Content Generation Section -->
			<section class="generation-section">
				<h2>Content Generation</h2>
				<div class="generation-buttons">
					<button 
						onclick={generateArticle} 
						disabled={generatingArticle || loading}
						class="generate-button generate-article"
					>
						{generatingArticle ? 'Generating...' : '📰 Generate Article'}
					</button>
					<button 
						onclick={generateRecipe} 
						disabled={generatingRecipe || loading}
						class="generate-button generate-recipe"
					>
						{generatingRecipe ? 'Generating...' : '🍳 Generate Recipe'}
					</button>
				</div>
				<p class="generation-hint">
					Generate a new article from recent news or a new recipe from random foods.
				</p>
			</section>

			<!-- Article Management Section -->
			<section class="article-section">
				<h2>Article Management</h2>
				{#if loading && articles.length === 0}
					<div class="loading">Loading articles...</div>
				{:else if articles.length === 0}
					<div class="empty">No articles found</div>
				{:else}
					<div class="pagination-controls-top">
						<div class="items-per-page">
							<label for="items-per-page-select-dashboard">Items per page:</label>
							<select 
								id="items-per-page-select-dashboard"
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
			</section>

			<!-- Text Management Section -->
			<section class="text-section">
				<h2>Text Management</h2>
				<div class="text-input-container">
					<input 
						type="text" 
						bind:value={newText} 
						placeholder="Enter text to add..."
						onkeydown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								addText();
							}
						}}
						disabled={loading}
					/>
					<button onclick={addText} disabled={loading || !newText.trim()}>
						Add Text
					</button>
				</div>
				<div class="texts-display">
					{#if texts.length === 0}
						<p class="empty">No texts added yet</p>
					{:else}
						<ul>
							{#each texts as text, index}
								<li>{text}</li>
							{/each}
						</ul>
					{/if}
				</div>
			</section>
		</div>
	</div>
{/if}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
	}

	.unauthorized {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		color: white;
		text-align: center;
	}

	.unauthorized h1 {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.unauthorized p {
		font-size: 1.2rem;
		opacity: 0.9;
	}

	.admin-panel {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
	}

	header {
		text-align: center;
		margin-bottom: 3rem;
		color: white;
	}

	header h1 {
		font-size: 2.5rem;
		margin-bottom: 1rem;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
	}

	.error {
		background: #ff4444;
		color: white;
		padding: 1rem;
		border-radius: 8px;
		margin-top: 1rem;
		text-align: center;
	}

	.sections {
		display: grid;
		gap: 2rem;
	}

	section {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
	}

	section h2 {
		margin-top: 0;
		margin-bottom: 1.5rem;
		color: #333;
		border-bottom: 3px solid #667eea;
		padding-bottom: 0.5rem;
	}

	.pagination-controls-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #eee;
	}

	.items-per-page {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.items-per-page label {
		font-weight: 500;
		color: #333;
		font-size: 0.9rem;
	}

	.items-per-page select {
		padding: 0.5rem 0.75rem;
		border: 2px solid #ddd;
		border-radius: 6px;
		background: white;
		color: #333;
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
		color: #666;
		font-size: 0.9rem;
	}

	.loading {
		text-align: center;
		padding: 2rem;
		color: #666;
	}

	.empty {
		text-align: center;
		color: #999;
		padding: 2rem;
		font-style: italic;
	}

	.text-input-container {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.text-input-container input {
		flex: 1;
		padding: 0.75rem 1rem;
		border: 2px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.text-input-container input:focus {
		outline: none;
		border-color: #667eea;
	}

	.text-input-container input:disabled {
		background: #f5f5f5;
		cursor: not-allowed;
	}

	.text-input-container button {
		background: #667eea;
		color: white;
		border: none;
		padding: 0.75rem 2rem;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 600;
		font-size: 1rem;
		transition: background 0.2s, transform 0.1s;
	}

	.text-input-container button:hover:not(:disabled) {
		background: #764ba2;
		transform: translateY(-1px);
	}

	.text-input-container button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.generation-section {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
	}

	.generation-buttons {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}

	.generate-button {
		flex: 1;
		min-width: 200px;
		padding: 1rem 2rem;
		border: none;
		border-radius: 8px;
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		color: white;
	}

	.generate-article {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.generate-article:hover:not(:disabled) {
		background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.generate-recipe {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
	}

	.generate-recipe:hover:not(:disabled) {
		background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
	}

	.generate-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.generation-hint {
		color: #666;
		font-size: 0.9rem;
		margin-top: 0.5rem;
		font-style: italic;
	}

	.texts-display {
		max-height: 400px;
		overflow-y: auto;
	}

	.texts-display ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.texts-display li {
		padding: 0.75rem 1rem;
		margin-bottom: 0.5rem;
		background: #f8f9fa;
		border-left: 4px solid #667eea;
		border-radius: 4px;
		transition: background 0.2s;
	}

	.texts-display li:hover {
		background: #e9ecef;
	}

	@media (max-width: 768px) {
		.admin-panel {
			padding: 1rem;
		}

		section {
			padding: 1.5rem;
		}

		.pagination-controls-top {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.text-input-container {
			flex-direction: column;
		}

		.text-input-container button {
			width: 100%;
		}
	}
</style>
