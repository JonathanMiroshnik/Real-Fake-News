<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { getApiBaseUrl } from '$lib/apiConfig';
	import { goto } from '$app/navigation';

	interface Article {
		key?: string;
		title?: string;
		content?: string;
		headImage?: string;
		category?: string;
		timestamp?: string;
	}

	let article = $state<Article | null>(null);
	let loading = $state(false);
	let saving = $state(false);
	let uploading = $state(false);
	let error = $state('');
	let successMessage = $state('');
	let password = $state('');

	// Form fields
	let title = $state('');
	let content = $state('');
	let headImage = $state('');
	
	// File upload
	let selectedFile = $state<File | null>(null);
	let imagePreview = $state<string | null>(null);

	const ADMIN_PASSWORD_PARAM = 'pwd';
	const API_BASE = getApiBaseUrl();
	const isFrontendDevMode = import.meta.env.VITE_FRONTEND_DEV_MODE === 'true' || 
	                          import.meta.env.VITE_LOCAL_DEV_MODE === 'true';

	// Get article key from URL
	const articleKey = $derived($page.params.key);

	// Fetch article
	async function fetchArticle() {
		if (!articleKey || !password || !browser) return;
		
		loading = true;
		error = '';
		try {
			const url = `${API_BASE}/admin/articles/${articleKey}?password=${encodeURIComponent(password)}`;
			const response = await fetch(url, {
				cache: 'no-store'
			});
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch article`);
			}
			
			const data = await response.json();
			if (data.success && data.article) {
				article = data.article;
				if (article) {
					title = article.title || '';
					content = article.content || '';
					headImage = article.headImage || '';
				}
			} else {
				throw new Error('Article not found');
			}
		} catch (err) {
			console.error('Error fetching article:', err);
			if (err instanceof TypeError && err.message.includes('fetch')) {
				error = 'Network error: Is the backend server running on ' + API_BASE + '?';
			} else {
				error = err instanceof Error ? err.message : 'Failed to fetch article';
			}
		} finally {
			loading = false;
		}
	}

	// Save article
	async function saveArticle() {
		if (!articleKey || !password || !browser) return;
		
		saving = true;
		error = '';
		successMessage = '';
		
		try {
			const url = `${API_BASE}/admin/articles/${articleKey}?password=${encodeURIComponent(password)}`;
			const response = await fetch(url, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					title: title.trim(),
					content: content.trim(),
					headImage: headImage.trim()
				})
			});
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || `HTTP ${response.status}: Failed to update article`);
			}
			
			const data = await response.json();
			if (data.success) {
				successMessage = 'Article saved successfully!';
				// Update local article state
				if (article) {
					article.title = title;
					article.content = content;
					article.headImage = headImage;
				}
				// Clear success message after 3 seconds
				setTimeout(() => {
					successMessage = '';
				}, 3000);
			} else {
				throw new Error('Failed to save article');
			}
		} catch (err) {
			console.error('Error saving article:', err);
			if (err instanceof TypeError && err.message.includes('fetch')) {
				error = 'Network error: Is the backend server running on ' + API_BASE + '?';
			} else {
				error = err instanceof Error ? err.message : 'Failed to save article';
			}
		} finally {
			saving = false;
		}
	}

	// Get image URL (images are served from /api/images/:filename)
	function getImageUrl(imageName: string | undefined): string {
		if (!imageName) return '';
		return `${API_BASE}/images/${encodeURIComponent(imageName)}`;
	}

	// Handle file selection
	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			selectedFile = file;
			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				imagePreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	// Upload image
	async function uploadImage() {
		if (!selectedFile || !password || !browser) return;
		
		uploading = true;
		error = '';
		successMessage = '';
		
		try {
			const formData = new FormData();
			formData.append('image', selectedFile);
			
			const url = `${API_BASE}/admin/images/upload?password=${encodeURIComponent(password)}`;
			const response = await fetch(url, {
				method: 'POST',
				body: formData
			});
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || `HTTP ${response.status}: Failed to upload image`);
			}
			
			const data = await response.json();
			if (data.success && data.filename) {
				headImage = data.filename;
				successMessage = 'Image uploaded successfully!';
				selectedFile = null;
				imagePreview = null;
				// Clear file input
				const fileInput = document.getElementById('image-upload') as HTMLInputElement;
				if (fileInput) fileInput.value = '';
				// Clear success message after 3 seconds
				setTimeout(() => {
					successMessage = '';
				}, 3000);
			} else {
				throw new Error('Failed to upload image');
			}
		} catch (err) {
			console.error('Error uploading image:', err);
			if (err instanceof TypeError && err.message.includes('fetch')) {
				error = 'Network error: Is the backend server running on ' + API_BASE + '?';
			} else {
				error = err instanceof Error ? err.message : 'Failed to upload image';
			}
		} finally {
			uploading = false;
		}
	}

	// Reactive password from URL changes
	$effect(() => {
		if (browser) {
			const urlPassword = $page.url.searchParams.get(ADMIN_PASSWORD_PARAM);
			if (urlPassword !== null) {
				password = urlPassword;
			} else {
				password = isFrontendDevMode ? 'changeme123' : '';
			}
		}
	});

	onMount(() => {
		if (!browser) return;
		const urlPassword = $page.url.searchParams.get(ADMIN_PASSWORD_PARAM);
		if (urlPassword !== null) {
			password = urlPassword;
		} else {
			password = isFrontendDevMode ? 'changeme123' : '';
		}
		fetchArticle();
	});
</script>

<svelte:head>
	<title>Edit Article - Admin Panel</title>
</svelte:head>

<div class="edit-page">
	<header class="page-header">
		<h1>Edit Article</h1>
		<button class="back-btn" onclick={() => goto(`/articles?${ADMIN_PASSWORD_PARAM}=${encodeURIComponent(password)}`)}>
			← Back to Articles
		</button>
	</header>

	{#if error && !loading}
		<div class="error-banner">{error}</div>
	{/if}

	{#if successMessage}
		<div class="success-banner">{successMessage}</div>
	{/if}

	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>Loading article...</p>
		</div>
	{:else if article}
		<div class="content-card">
			<form onsubmit={(e) => { e.preventDefault(); saveArticle(); }}>
				<div class="form-group">
					<label for="title">Title</label>
					<input 
						type="text" 
						id="title"
						bind:value={title}
						placeholder="Article title"
						disabled={saving}
					/>
				</div>

				<div class="form-group">
					<label for="content">Content</label>
					<textarea 
						id="content"
						bind:value={content}
						placeholder="Article content (markdown supported)"
						disabled={saving}
						rows="20"
					></textarea>
				</div>

				<div class="form-group">
					<label for="headImage">Image</label>
					
					<!-- File Upload Section -->
					<div class="upload-section">
						<label for="image-upload" class="upload-label">
							<input 
								type="file" 
								id="image-upload"
								accept="image/*"
								onchange={handleFileSelect}
								disabled={uploading || saving}
								style="display: none;"
							/>
							<span class="upload-button">📁 Choose Image File</span>
						</label>
						
						{#if selectedFile}
							<div class="file-info">
								<p>Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
								{#if imagePreview}
									<div class="image-preview">
										<p class="preview-label">Preview:</p>
										<img src={imagePreview} alt="Preview" />
									</div>
								{/if}
								<button 
									type="button"
									class="upload-btn" 
									onclick={uploadImage}
									disabled={uploading || saving}
								>
									{uploading ? 'Uploading...' : '⬆️ Upload Image'}
								</button>
							</div>
						{/if}
					</div>
					
					<!-- Manual Image Name Input -->
					<div class="manual-input-section">
						<label for="headImage" class="manual-label">Or enter image filename manually:</label>
						<input 
							type="text" 
							id="headImage"
							bind:value={headImage}
							placeholder="Image filename (e.g., img-123.png)"
							disabled={saving}
						/>
					</div>
					
					<!-- Current Image Display -->
					{#if headImage && !imagePreview}
						<div class="image-preview">
							<p class="preview-label">Current Image:</p>
							<img src={getImageUrl(headImage)} alt="Article" onerror={(e) => { 
								const target = e.currentTarget as HTMLImageElement;
								target.style.display = 'none';
							}} />
						</div>
					{/if}
				</div>

				<div class="form-actions">
					<button 
						type="submit" 
						class="save-btn" 
						disabled={saving || !title.trim() || !content.trim()}
					>
						{saving ? 'Saving...' : '💾 Save Changes'}
					</button>
				</div>
			</form>
		</div>
	{:else if !loading}
		<div class="empty-state">
			<p>Article not found</p>
		</div>
	{/if}
</div>

<style>
	.edit-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
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

	.back-btn {
		background: #6c757d;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 500;
		font-size: 1rem;
		transition: background 0.2s;
		text-decoration: none;
	}

	.back-btn:hover {
		background: #5a6268;
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
		background: #28a745;
		color: white;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 2rem;
		text-align: center;
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
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

	.content-card {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.form-group {
		margin-bottom: 2rem;
	}

	.form-group label {
		display: block;
		font-weight: 600;
		color: #2c3e50;
		margin-bottom: 0.5rem;
		font-size: 1rem;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		font-family: inherit;
		transition: border-color 0.2s;
		box-sizing: border-box;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #667eea;
	}

	.form-group input:disabled,
	.form-group textarea:disabled {
		background: #f5f5f5;
		cursor: not-allowed;
	}

	.form-group textarea {
		resize: vertical;
		min-height: 300px;
		font-family: 'Courier New', monospace;
	}

	.upload-section {
		margin-bottom: 1rem;
	}

	.upload-label {
		display: inline-block;
		cursor: pointer;
	}

	.upload-button {
		display: inline-block;
		background: #667eea;
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 500;
		transition: background 0.2s;
	}

	.upload-button:hover {
		background: #5568d3;
	}

	.file-info {
		margin-top: 1rem;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 8px;
	}

	.file-info p {
		margin: 0 0 0.5rem 0;
		color: #495057;
		font-size: 0.9rem;
	}

	.upload-btn {
		background: #28a745;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		font-size: 0.9rem;
		transition: background 0.2s, transform 0.1s;
		margin-top: 0.5rem;
	}

	.upload-btn:hover:not(:disabled) {
		background: #218838;
		transform: translateY(-1px);
	}

	.upload-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.manual-input-section {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e0e0e0;
	}

	.manual-label {
		display: block;
		font-weight: 500;
		color: #6c757d;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}

	.image-preview {
		margin-top: 1rem;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 8px;
	}

	.preview-label {
		font-weight: 500;
		color: #495057;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}

	.image-preview img {
		max-width: 100%;
		max-height: 400px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid #e0e0e0;
	}

	.save-btn {
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

	.save-btn:hover:not(:disabled) {
		background: #5568d3;
		transform: translateY(-1px);
	}

	.save-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	@media (max-width: 768px) {
		.edit-page {
			padding: 1rem;
		}

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

		.form-group textarea {
			min-height: 200px;
		}
	}
</style>

