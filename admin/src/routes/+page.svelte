<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	let articlesCount = 0;
	let textsCount = 0;
	let loading = true;
	let error = '';

	const ADMIN_PASSWORD_PARAM = 'pwd';
	let password = '';

	// API base URL
	const isDevMode = import.meta.env.VITE_LOCAL_DEV_MODE === 'true';
	const API_BASE = isDevMode
		? (import.meta.env.VITE_API_BASE_DEV || 'http://localhost:5001/api')
		: (import.meta.env.VITE_API_BASE_PROD || 'https://real.sensorcensor.xyz/api');

	async function fetchStats() {
		if (!password || !browser) return;

		loading = true;
		error = '';

		try {
			// Fetch articles
			const articlesUrl = `${API_BASE}/admin/articles?password=${encodeURIComponent(password)}`;
			const articlesResponse = await fetch(articlesUrl);
			
			if (articlesResponse.ok) {
				const articlesData = await articlesResponse.json();
				articlesCount = articlesData.articles?.length || 0;
			}

			// Fetch texts
			const textsUrl = `${API_BASE}/admin/texts?password=${encodeURIComponent(password)}`;
			const textsResponse = await fetch(textsUrl);
			
			if (textsResponse.ok) {
				const textsData = await textsResponse.json();
				textsCount = textsData.texts?.length || 0;
			}
		} catch (err) {
			console.error('Error fetching stats:', err);
			error = err instanceof Error ? err.message : 'Failed to fetch statistics';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		if (!browser) return;
		const urlPassword = $page.url.searchParams.get(ADMIN_PASSWORD_PARAM);
		password = urlPassword || 'debug';
		fetchStats();
	});
</script>

<svelte:head>
	<title>Dashboard - Admin Panel</title>
</svelte:head>

<div class="dashboard">
	<header class="page-header">
		<h1>Dashboard</h1>
		<p class="subtitle">Overview of your content management system</p>
	</header>

	{#if error}
		<div class="error-banner">{error}</div>
	{/if}

	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>Loading statistics...</p>
		</div>
	{:else}
		<div class="stats-grid">
			<div class="stat-card">
				<div class="stat-icon">📰</div>
				<div class="stat-content">
					<h2>{articlesCount}</h2>
					<p>Total Articles</p>
				</div>
			</div>

			<div class="stat-card">
				<div class="stat-icon">📝</div>
				<div class="stat-content">
					<h2>{textsCount}</h2>
					<p>Text Items</p>
				</div>
			</div>

			<div class="stat-card">
				<div class="stat-icon">⚡</div>
				<div class="stat-content">
					<h2>Active</h2>
					<p>System Status</p>
				</div>
			</div>
		</div>

		<div class="quick-actions">
			<h2>Quick Actions</h2>
			<div class="actions-grid">
				<a href="/articles?pwd={password}" class="action-card">
					<span class="action-icon">📰</span>
					<h3>Manage Articles</h3>
					<p>View, edit, and delete articles</p>
				</a>
				<a href="/settings?pwd={password}" class="action-card">
					<span class="action-icon">⚙️</span>
					<h3>Settings</h3>
					<p>Configure admin panel settings</p>
				</a>
			</div>
		</div>
	{/if}
</div>

<style>
	.dashboard {
		max-width: 1200px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.page-header h1 {
		font-size: 2.5rem;
		margin: 0 0 0.5rem 0;
		color: #2c3e50;
	}

	.subtitle {
		color: #7f8c8d;
		font-size: 1.1rem;
		margin: 0;
	}

	.error-banner {
		background: #ff4444;
		color: white;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 2rem;
		text-align: center;
	}

	.loading-state {
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

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.stat-card {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		gap: 1.5rem;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.stat-icon {
		font-size: 3rem;
	}

	.stat-content h2 {
		margin: 0;
		font-size: 2.5rem;
		color: #2c3e50;
	}

	.stat-content p {
		margin: 0.5rem 0 0 0;
		color: #7f8c8d;
		font-size: 0.9rem;
	}

	.quick-actions {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.quick-actions h2 {
		margin: 0 0 1.5rem 0;
		color: #2c3e50;
		font-size: 1.5rem;
	}

	.actions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.action-card {
		background: #f8f9fa;
		border-radius: 8px;
		padding: 1.5rem;
		text-decoration: none;
		color: inherit;
		transition: all 0.2s;
		border: 2px solid transparent;
	}

	.action-card:hover {
		background: #e9ecef;
		border-color: #667eea;
		transform: translateY(-2px);
	}

	.action-icon {
		font-size: 2.5rem;
		display: block;
		margin-bottom: 1rem;
	}

	.action-card h3 {
		margin: 0 0 0.5rem 0;
		color: #2c3e50;
		font-size: 1.2rem;
	}

	.action-card p {
		margin: 0;
		color: #7f8c8d;
		font-size: 0.9rem;
	}

	@media (max-width: 768px) {
		.page-header h1 {
			font-size: 2rem;
		}

		.stats-grid,
		.actions-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
