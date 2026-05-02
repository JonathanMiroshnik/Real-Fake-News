# Client — React SPA Frontend

The main frontend for Real-Fake-News. Built with React, TypeScript, and Vite.

## Architecture

The client runs inside an nginx container that serves static files and proxies API requests:

```
real.sensorcensor.xyz → (shared nginx) → client:80
                                    ├── /              → serves React SPA
                                    ├── /api/*         → proxy_pass to server:5001
                                    └── /admin/*       → proxy_pass to admin:80
```

See `nginx.conf` for the exact routing rules.

## Changes for VPS Deployment

- **`nginx.conf`**: Added `location /admin` block proxying to `admin:80` (the admin SvelteKit container).
- **`nginx.conf`**: Static file caching regex excludes `/api` paths to prevent API image requests from being treated as static files. Fix: `location ~* ^(?!/api)/.*\.(js|css|png|...)`
- **`Dockerfile`**: Removed `HEALTHCHECK` — not needed for the VPS deploy flow.

## Environment Configuration

For information about configuring environment variables (backend connection, debug logging, etc.), see [ENV_CONFIG.example](../../ENV_CONFIG.example) in the root directory.

### Key Environment Variables

| Variable                | Purpose                                    | Default              |
| ----------------------- | ------------------------------------------ | -------------------- |
| `VITE_BACKEND_DEV_MODE` | Use `localhost:5001` for dev               | `false`              |
| `VITE_USE_RELATIVE_API` | Use relative `/api` URLs (for nginx proxy) | `true`               |
| `VITE_API_BASE_PROD`    | Production backend URL                     | `http://server:5001` |
| `VITE_SHOW_HOROSCOPES`  | Show/hide horoscope section                | `true`               |
| `VITE_DEBUG_LOGS`       | Enable console debug logging               | `false`              |
