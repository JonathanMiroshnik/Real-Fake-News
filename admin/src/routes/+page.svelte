<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	// Disable SSR - this page is client-only
	export const ssr = false;

	interface Article {
		key?: string;
		title?: string;
		category?: string;
		timestamp?: string;
	}

	let articles: Article[] = [];
	let texts: string[] = [];
	let newText = '';
	let loading = false;
	let error = '';
	let password = '';
	let isAuthorized = false;

	// API base URL - determined by dev/prod mode
	const isDevMode = import.meta.env.VITE_LOCAL_DEV_MODE === 'true';
	const API_BASE = isDevMode
		? (import.meta.env.VITE_API_BASE_DEV || 'http://localhost:5001/api')
		: (import.meta.env.VITE_API_BASE_PROD || 'https://real.sensorcensor.xyz/api');
	const ADMIN_PASSWORD_PARAM = 'pwd';

	// Password and authorization will be set in onMount (client-side only)

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

	// Get article URL (assuming articles are displayed on the main site)
	function getArticleUrl(key: string | undefined): string {
		if (!key) return '#';
		// Use environment variable to determine client URL based on dev/prod mode
		const clientUrl = isDevMode 
			? (import.meta.env.VITE_CLIENT_URL_DEV || 'http://localhost:5173')
			: (import.meta.env.VITE_CLIENT_URL_PROD || 'https://real.sensorcensor.xyz');
		return `${clientUrl}/article/${key}`;
	}

	// Load data when authorized (only on client)
	onMount(() => {
		const urlPassword = $page.url.searchParams.get(ADMIN_PASSWORD_PARAM);
		if (urlPassword !== null) {
			password = urlPassword;
		} else {
			// In development, use default password; in production, require URL parameter
			if (isDevMode) {
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
			<!-- Article Management Section -->
			<section class="article-section">
				<h2>Article Management</h2>
				{#if loading && articles.length === 0}
					<div class="loading">Loading articles...</div>
				{:else}
					<div class="table-container">
						<table>
							<thead>
								<tr>
									<th>Title</th>
									<th>Category</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{#if articles.length === 0}
									<tr>
										<td colspan="3" class="empty">No articles found</td>
									</tr>
								{:else}
									{#each articles.map((article, index) => ({ ...article, _index: index })) as article (article.key ? article.key : `article-${article._index}`)}
										<tr>
											<td>
												<a href={getArticleUrl(article.key)} target="_blank" rel="noopener noreferrer">
													{article.title || 'Untitled'}
												</a>
											</td>
											<td>{article.category || 'Uncategorized'}</td>
											<td>
												<button 
													class="delete-btn" 
													onclick={() => deleteArticle(article.key)}
													disabled={loading}
												>
													Delete
												</button>
											</td>
										</tr>
									{/each}
								{/if}
							</tbody>
						</table>
					</div>
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

	.loading {
		text-align: center;
		padding: 2rem;
		color: #666;
	}

	.table-container {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	thead {
		background: #667eea;
		color: white;
	}

	th {
		padding: 1rem;
		text-align: left;
		font-weight: 600;
	}

	td {
		padding: 1rem;
		border-bottom: 1px solid #eee;
	}

	tbody tr:hover {
		background: #f5f5f5;
	}

	tbody tr:last-child td {
		border-bottom: none;
	}

	td a {
		color: #667eea;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
	}

	td a:hover {
		color: #764ba2;
		text-decoration: underline;
	}

	.empty {
		text-align: center;
		color: #999;
		padding: 2rem;
		font-style: italic;
	}

	.delete-btn {
		background: #ff4444;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
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

		.text-input-container {
			flex-direction: column;
		}

		.text-input-container button {
			width: 100%;
		}

		table {
			font-size: 0.9rem;
		}

		th, td {
			padding: 0.75rem 0.5rem;
		}
	}
</style>
