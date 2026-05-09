<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { getApiBaseUrlWithPrefix } from '$lib/apiConfig';
	import { goto } from '$app/navigation';

	// Disable SSR - this page is client-only
	export const ssr = false;

	interface Writer {
		key: string;
		name: string;
		description: string;
		systemPrompt: string;
		createdAt: string;
		updatedAt: string;
	}

	// Valid categories from server constants
	const VALID_CATEGORIES = ["Politics", "Sports", "Culture", "Economics", "Technology", "Food"];

	let title = $state('');
	let category = $state(VALID_CATEGORIES[0]);
	let writerType = $state('random'); // 'random' or 'specific'
	let writerId = $state('');
	let override = $state('');
	let writers = $state<Writer[]>([]);
	let loading = $state(false);
	let generating = $state(false);
	let error = $state('');
	let success = $state('');
	let password = $state('');
	let isAuthorized = $state(false);

	// API base URL (with /api prefix) - determined by VITE_BACKEND_DEV_MODE
	const API_BASE = getApiBaseUrlWithPrefix();
	const ADMIN_PASSWORD_PARAM = 'pwd';
	const isFrontendDevMode = import.meta.env.VITE_FRONTEND_DEV_MODE === 'true' || 
	                          import.meta.env.VITE_LOCAL_DEV_MODE === 'true'; // Backward compatibility

	// Fetch all writers for selection
	async function fetchWriters() {
		if (!password || !browser) return;
		
		loading = true;
		try {
			// Note: We need to get writers from the database
			// For now, we'll use a placeholder - in a real implementation,
			// we would need a GET /api/admin/writers endpoint
			// Since we don't have that, we'll use the existing writer database
			const url = `${API_BASE}/admin/articles?password=${encodeURIComponent(password)}&_t=${Date.now()}`;
			const response = await fetch(url, {
				cache: 'no-store'
			});
			
			if (!response.ok) {
				// If we can't fetch writers, we'll just use random writer option
				console.warn('Could not fetch writers, using random writer only');
				writers = [];
				return;
			}
			
			// Note: This is a workaround - we need a proper writers endpoint
			// For now, we'll create a placeholder list
			writers = [
				{
					key: 'writer-1',
					name: 'Tech Journalist',
					description: 'Specializes in technology and AI topics',
					systemPrompt: 'Write in a technical but accessible style, focusing on innovation and future implications.',
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				},
				{
					key: 'writer-2',
					name: 'Political Analyst',
					description: 'Expert in political commentary and analysis',
					systemPrompt: 'Write with authority and insight, providing balanced analysis of political developments.',
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				},
				{
					key: 'writer-3',
					name: 'Cultural Critic',
					description: 'Focuses on arts, culture, and society',
					systemPrompt: 'Write with wit and cultural insight, connecting trends to broader societal themes.',
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				}
			];
		} catch (err) {
			console.error('Error fetching writers:', err);
			writers = [];
		} finally {
			loading = false;
		}
	}

	// Generate article with details
	async function generateArticleWithDetails() {
		if (!password || !browser || !title.trim()) {
			error = 'Title is required';
			return;
		}

		if (!category) {
			error = 'Category is required';
			return;
		}

		if (!writerType) {
			error = 'Writer type is required';
			return;
		}

		if (writerType === 'specific' && !writerId) {
			error = 'Please select a writer';
			return;
		}

		generating = true;
		error = '';
		success = '';

		try {
			const url = `${API_BASE}/admin/generate/article-with-details?password=${encodeURIComponent(password)}`;
			const requestBody: any = {
				title: title.trim(),
				category: category,
				writerType: writerType
			};

			if (writerType === 'specific' && writerId) {
				requestBody.writerId = writerId;
			}

			if (override.trim()) {
				requestBody.override = override.trim();
			}

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody)
			});
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || `HTTP ${response.status}: Failed to generate article`);
			}
			
			const data = await response.json();
			if (data.success) {
				success = 'Article generated successfully!';
				// Clear form
				title = '';
				override = '';
				// Keep category and writer type for convenience
				
				// Optionally redirect to articles list after a delay
				setTimeout(() => {
					goto('/?pwd=' + encodeURIComponent(password));
				}, 2000);
			} else {
				throw new Error(data.error || 'Failed to generate article');
			}
		} catch (err) {
			console.error('Error generating article with details:', err);
			if (err instanceof TypeError && err.message.includes('fetch')) {
				error = 'Network error: Is the backend server running on ' + API_BASE + '?';
			} else {
				error = err instanceof Error ? err.message : 'Failed to generate article with details';
			}
		} finally {
			generating = false;
		}
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
		fetchWriters();
	});
</script>

<svelte:head>
	<title>Generate Article with Details - Admin Panel</title>
</svelte:head>

{#if !isAuthorized}
	<div class="unauthorized">
		<h1>Access Denied</h1>
		<p>This page requires authorization.</p>
	</div>
{:else}
	<div class="generate-article-page">
		<header>
			<h1>Generate Article with Details</h1>
			<p class="subtitle">Create a custom article with specific title, category, writer, and optional override instructions.</p>
			
			{#if error}
				<div class="error">{error}</div>
			{/if}
			
			{#if success}
				<div class="success">{success}</div>
			{/if}
		</header>

		<div class="content">
			<form onsubmit={generateArticleWithDetails} class="article-form">
				<div class="form-section">
					<h2>Article Details</h2>
					
					<div class="form-group">
						<label for="title">Title *</label>
						<input 
							type="text" 
							id="title"
							bind:value={title}
							placeholder="Enter article title (e.g., 'AI Discovers Ancient Civilization on Mars')"
							required
							disabled={generating || loading}
						/>
						<p class="help-text">This will be used as the basis for generating the article content.</p>
					</div>

					<div class="form-group">
						<label for="category">Category *</label>
						<select 
							id="category"
							bind:value={category}
							disabled={generating || loading}
						>
							{#each VALID_CATEGORIES as cat}
								<option value={cat}>{cat}</option>
							{/each}
						</select>
						<p class="help-text">Select the most relevant category for your article.</p>
					</div>
				</div>

				<div class="form-section">
					<h2>Writer Selection</h2>
					
					<div class="form-group">
						<label>Writer Type *</label>
						<div class="radio-group">
							<label class="radio-option">
								<input 
									type="radio" 
									name="writerType" 
									value="random"
									bind:group={writerType}
									disabled={generating || loading}
								/>
								<span class="radio-label">Random Writer</span>
								<span class="radio-description">Let the system choose a writer randomly</span>
							</label>
							
							<label class="radio-option">
								<input 
									type="radio" 
									name="writerType" 
									value="specific"
									bind:group={writerType}
									disabled={generating || loading || writers.length === 0}
								/>
								<span class="radio-label">Specific Writer</span>
								<span class="radio-description">Choose a specific writer style</span>
							</label>
						</div>
					</div>

					{#if writerType === 'specific'}
						<div class="form-group">
							<label for="writerId">Select Writer *</label>
							{#if loading}
								<select id="writerId" disabled>
									<option>Loading writers...</option>
								</select>
							{:else if writers.length === 0}
								<select id="writerId" disabled>
									<option>No writers available</option>
								</select>
								<p class="help-text error">No writers found. Using random writer instead.</p>
							{:else}
								<select 
									id="writerId"
									bind:value={writerId}
									disabled={generating}
									required
								>
									<option value="">Select a writer...</option>
									{#each writers as writer}
										<option value={writer.key}>{writer.name} - {writer.description}</option>
									{/each}
								</select>
								<p class="help-text">Choose a writer style for the article.</p>
							{/if}
						</div>
					{/if}
				</div>

				<div class="form-section">
					<h2>Advanced Options</h2>
					
					<div class="form-group">
						<label for="override">Override Instructions (Optional)</label>
						<textarea 
							id="override"
							bind:value={override}
							placeholder="Enter additional instructions to override the default writing style (e.g., 'Write in a humorous tone', 'Focus on environmental implications', 'Make it sound like breaking news')"
							rows={4}
							disabled={generating || loading}
						></textarea>
						<p class="help-text">These instructions will be added to the generation prompt to influence the writing style and content focus.</p>
					</div>
				</div>

				<div class="form-actions">
					<button 
						type="button" 
						class="btn-secondary"
						onclick={() => goto('/?pwd=' + encodeURIComponent(password))}
						disabled={generating}
					>
						← Back to Dashboard
					</button>
					
					<button 
						type="submit" 
						class="btn-primary"
						disabled={generating || loading || !title.trim() || !category || !writerType}
					>
						{#if generating}
							<span class="spinner"></span> Generating...
						{:else}
							📝 Generate Article
						{/if}
					</button>
				</div>
			</form>

			<div class="info-panel">
				<h3>How it works</h3>
				<ul>
					<li><strong>Title:</strong> Provides the main topic for the article generation.</li>
					<li><strong>Category:</strong> Determines the article's classification and influences the writing style.</li>
					<li><strong>Writer:</strong> Controls the writing style - random or specific writer persona.</li>
					<li><strong>Override Instructions:</strong> Additional guidance for the AI to customize the output.</li>
					<li>The system will generate a complete article with title, content, image, and metadata.</li>
				</ul>
				
				<h3>Tips for best results</h3>
				<ul>
					<li>Use clear, descriptive titles for better article generation</li>
					<li>Choose the category that best matches your topic</li>
					<li>Use override instructions to fine-tune the writing style</li>
					<li>Check the generated article in the dashboard after creation</li>
				</ul>
			</div>
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

	.generate-article-page {
		max-width: 1200px;
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
		margin-bottom: 0.5rem;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
	}

	.subtitle {
		font-size: 1.1rem;
		opacity: 0.9;
		margin-bottom: 1.5rem;
	}

	.error {
		background: #ff4444;
		color: white;
		padding: 1rem;
		border-radius: 8px;
		margin-top: 1rem;
		text-align: center;
	}

	.success {
		background: #4CAF50;
		color: white;
		padding: 1rem;
		border-radius: 8px;
		margin-top: 1rem;
		text-align: center;
	}

	.content {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 2rem;
	}

	@media (max-width: 768px) {
		.content {
			grid-template-columns: 1fr;
		}
	}

	.article-form {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
	}

	.form-section {
		margin-bottom: 2.5rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid #eee;
	}

	.form-section:last-of-type {
		border-bottom: none;
		margin-bottom: 1.5rem;
	}

	.form-section h2 {
		margin-top: 0;
		margin-bottom: 1.5rem;
		color: #333;
		border-bottom: 3px solid #667eea;
		padding-bottom: 0.5rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #333;
	}

	.form-group input[type="text"],
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 2px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
		box-sizing: border-box;
	}

	.form-group input[type="text"]:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #667eea;
	}

	.form-group input[type="text"]:disabled,
	.form-group select:disabled,
	.form-group textarea:disabled {
		background: #f5f5f5;
		cursor: not-allowed;
	}

	.help-text {
		margin-top: 0.5rem;
		font-size: 0.85rem;
		color: #666;
	}

	.help-text.error {
		color: #ff4444;
	}

	.radio-group {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.radio-option {
		display: flex;
		flex-direction: column;
		padding: 1rem;
		border: 2px solid #ddd;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.radio-option:hover {
		border-color: #667eea;
		background: #f8f9ff;
	}

	.radio-option input[type="radio"] {
		margin-right: 0.5rem;
	}

	.radio-label {
		font-weight: 600;
		color: #333;
		margin-bottom: 0.25rem;
	}

	.radio-description {
		font-size: 0.9rem;
		color: #666;
	}

	.form-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid #eee;
	}

	.btn-primary,
	.btn-secondary {
		padding: 0.75rem 2rem;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.btn-secondary {
		background: #f5f5f5;
		color: #333;
		border: 2px solid #ddd;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #e9ecef;
		border-color: #667eea;
	}

	.btn-secondary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.spinner {
		display: inline-block;
		width: 1rem;
		height: 1rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: white;
		animation: spin 1s ease-in-out infinite;
		margin-right: 0.5rem;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.info-panel {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
		align-self: start;
	}

	.info-panel h3 {
		margin-top: 0;
		margin-bottom: 1rem;
		color: #333;
		border-bottom: 2px solid #667eea;
		padding-bottom: 0.5rem;
	}

	.info-panel ul {
		margin: 0;
		padding-left: 1.5rem;
		margin-bottom: 2rem;
	}

	.info-panel li {
		margin-bottom: 0.5rem;
		color: #555;
	}

	.info-panel li:last-child {
		margin-bottom: 0;
	}

	.info-panel strong {
		color: #333;
	}

	@media (max-width: 768px) {
		.generate-article-page {
			padding: 1rem;
		}

		.article-form,
		.info-panel {
			padding: 1.5rem;
		}

		.form-actions {
			flex-direction: column;
			gap: 1rem;
		}

		.btn-primary,
		.btn-secondary {
			width: 100%;
		}
	}
</style>
