import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Use static adapter for Docker builds (serves as static files via nginx)
		// fallback: 'index.html' enables SPA mode - all routes handled client-side
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false,
			strict: false
		}),
		// Set base path for serving under /admin subdirectory
		// This makes SvelteKit generate paths like /admin/_app/... instead of /_app/...
		paths: {
			base: process.env.SVELTEKIT_BASE_PATH || ''
		}
	}
};

export default config;
