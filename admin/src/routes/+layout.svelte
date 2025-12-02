<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	import { getApiBaseUrl } from '$lib/apiConfig';

	const ADMIN_PASSWORD_PARAM = 'pwd';

	// API base URL - determined by VITE_BACKEND_DEV_MODE
	const API_BASE = getApiBaseUrl();
	// Frontend dev mode for other frontend-specific behavior (like default password)
	const isFrontendDevMode = import.meta.env.VITE_FRONTEND_DEV_MODE === 'true' || 
	                          import.meta.env.VITE_LOCAL_DEV_MODE === 'true'; // Backward compatibility

	// Navigation items
	const navItems = [
		{ path: '/', label: 'Dashboard', icon: '📊' },
		{ path: '/articles', label: 'Articles', icon: '📰' },
		{ path: '/settings', label: 'Settings', icon: '⚙️' }
	];

	// Always authorized - actual password validation happens on backend API calls
	let isAuthorized = $state(true);
	let password = $state('');

	// Get password from URL on mount (client-side only)
	onMount(() => {
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

	// Reactive password from URL changes
	$effect(() => {
		if (browser) {
			const urlPassword = $page.url.searchParams.get(ADMIN_PASSWORD_PARAM);
			if (urlPassword !== null) {
				password = urlPassword;
			} else if (isFrontendDevMode) {
				password = 'changeme123';
			}
		}
	});

	function isActive(path: string): boolean {
		if (!browser) return false;
		return $page.url.pathname === path;
	}

	function navigate(path: string) {
		if (!browser) return;
		const url = new URL($page.url);
		url.pathname = path;
		if (password) {
			url.searchParams.set(ADMIN_PASSWORD_PARAM, password);
		}
		goto(url.toString());
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Admin Panel</title>
</svelte:head>

{#if !isAuthorized}
	<div class="unauthorized">
		<h1>Access Denied</h1>
		<p>This page requires authorization.</p>
	</div>
{:else}
	<div class="admin-layout">
		<nav class="sidebar">
			<div class="sidebar-header">
				<h1>Admin Panel</h1>
			</div>
			<ul class="nav-list">
				{#each navItems as item}
					<li>
						<button
							class="nav-item"
							class:active={isActive(item.path)}
							onclick={() => navigate(item.path)}
						>
							<span class="icon">{item.icon}</span>
							<span class="label">{item.label}</span>
						</button>
					</li>
				{/each}
			</ul>
		</nav>
		<main class="main-content">
			{@render children()}
		</main>
	</div>
{/if}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		background: #f5f7fa;
		min-height: 100vh;
	}

	.unauthorized {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		color: #333;
		text-align: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.unauthorized h1 {
		font-size: 3rem;
		margin-bottom: 1rem;
		color: white;
	}

	.unauthorized p {
		font-size: 1.2rem;
		opacity: 0.9;
		color: white;
	}

	.admin-layout {
		display: flex;
		min-height: 100vh;
	}

	.sidebar {
		width: 260px;
		background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
		color: white;
		box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		position: fixed;
		height: 100vh;
		overflow-y: auto;
	}

	.sidebar-header {
		padding: 2rem 1.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.sidebar-header h1 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.nav-list {
		list-style: none;
		padding: 1rem 0;
		margin: 0;
		flex: 1;
	}

	.nav-list li {
		margin: 0;
	}

	.nav-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.5rem;
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.8);
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		font-size: 1rem;
		font-family: inherit;
	}

	.nav-item:hover {
		background: rgba(255, 255, 255, 0.1);
		color: white;
	}

	.nav-item.active {
		background: rgba(102, 126, 234, 0.2);
		color: white;
		border-left: 4px solid #667eea;
	}

	.nav-item .icon {
		font-size: 1.2rem;
	}

	.nav-item .label {
		font-weight: 500;
	}

	.main-content {
		flex: 1;
		margin-left: 260px;
		padding: 2rem;
		background: #f5f7fa;
		min-height: 100vh;
	}

	@media (max-width: 768px) {
		.sidebar {
			width: 100%;
			height: auto;
			position: relative;
		}

		.nav-list {
			display: flex;
			overflow-x: auto;
		}

		.nav-item {
			white-space: nowrap;
		}

		.main-content {
			margin-left: 0;
			padding: 1rem;
		}
	}
</style>
