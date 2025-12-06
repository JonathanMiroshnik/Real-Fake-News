import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	// Load env file based on `mode` in the current working directory.
	const env = loadEnv(mode, process.cwd(), '');
	
	return {
		plugins: [sveltekit()],
		server: {
			host: '0.0.0.0', // Allow external connections
			port: parseInt(env.VITE_PORT || '5174', 10),
			strictPort: false
		}
	};
});
