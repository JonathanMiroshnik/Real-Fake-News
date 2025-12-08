<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	let password = '';
	let texts: string[] = [];
	let newText = '';
	let loading = false;
	let error = '';
	let success = '';

	import { getApiBaseUrlWithPrefix } from '$lib/apiConfig';

	const ADMIN_PASSWORD_PARAM = 'pwd';

	// API base URL - determined by VITE_BACKEND_DEV_MODE
	const API_BASE = getApiBaseUrlWithPrefix();
	// Frontend dev mode for other frontend-specific behavior
	const isFrontendDevMode = import.meta.env.VITE_FRONTEND_DEV_MODE === 'true' || 
	                          import.meta.env.VITE_LOCAL_DEV_MODE === 'true'; // Backward compatibility

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
		success = '';
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
			success = 'Text added successfully!';
			setTimeout(() => success = '', 3000);
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

	onMount(() => {
		if (!browser) return;
		const urlPassword = $page.url.searchParams.get(ADMIN_PASSWORD_PARAM);
		password = urlPassword || 'debug';
		fetchTexts();
	});
</script>

<svelte:head>
	<title>Settings - Admin Panel</title>
</svelte:head>

<div class="settings-page">
	<header class="page-header">
		<h1>Settings</h1>
		<p class="subtitle">Manage text items and configuration</p>
	</header>

	{#if error}
		<div class="error-banner">{error}</div>
	{/if}

	{#if success}
		<div class="success-banner">{success}</div>
	{/if}

	<div class="settings-grid">
		<!-- Text Management Section -->
		<div class="settings-card">
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
				{#if loading && texts.length === 0}
					<div class="loading-state">
						<div class="spinner"></div>
						<p>Loading texts...</p>
					</div>
				{:else if texts.length === 0}
					<p class="empty">No texts added yet</p>
				{:else}
					<ul>
						{#each texts as text, index}
							<li>
								<span class="text-number">{index + 1}.</span>
								<span class="text-content">{text}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>

		<!-- Configuration Section -->
		<div class="settings-card">
			<h2>Configuration</h2>
			<div class="config-info">
				<div class="info-item">
					<label>API Base URL</label>
					<code>{API_BASE}</code>
				</div>
				<div class="info-item">
					<label>Backend Mode</label>
					<code>{import.meta.env.VITE_BACKEND_DEV_MODE === 'true' ? 'Development' : 'Production'}</code>
				</div>
				<div class="info-item">
					<label>Frontend Mode</label>
					<code>{isFrontendDevMode ? 'Development' : 'Production'}</code>
				</div>
				<div class="info-item">
					<label>Text Items Count</label>
					<code>{texts.length}</code>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.settings-page {
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

	.success-banner {
		background: #4caf50;
		color: white;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 2rem;
		text-align: center;
	}

	.settings-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 2rem;
	}

	.settings-card {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.settings-card h2 {
		margin: 0 0 1.5rem 0;
		color: #2c3e50;
		font-size: 1.5rem;
		border-bottom: 3px solid #667eea;
		padding-bottom: 0.5rem;
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

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		color: #7f8c8d;
	}

	.spinner {
		width: 30px;
		height: 30px;
		border: 3px solid #e0e0e0;
		border-top-color: #667eea;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 0.5rem;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.empty {
		text-align: center;
		color: #999;
		padding: 2rem;
		font-style: italic;
	}

	.texts-display ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.texts-display li {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
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

	.text-number {
		font-weight: 600;
		color: #667eea;
		min-width: 2rem;
	}

	.text-content {
		flex: 1;
		color: #2c3e50;
	}

	.config-info {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.info-item label {
		font-weight: 600;
		color: #7f8c8d;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.info-item code {
		background: #f8f9fa;
		padding: 0.75rem 1rem;
		border-radius: 6px;
		font-family: 'Courier New', monospace;
		color: #2c3e50;
		border: 1px solid #e0e0e0;
	}

	@media (max-width: 768px) {
		.settings-grid {
			grid-template-columns: 1fr;
		}

		.page-header h1 {
			font-size: 2rem;
		}

		.text-input-container {
			flex-direction: column;
		}

		.text-input-container button {
			width: 100%;
		}
	}
</style>

