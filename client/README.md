# Client — React SPA Frontend

The main frontend for Real-Fake-News. Built with React, TypeScript, and Vite.

## Architecture

The client runs inside an nginx container that serves static files and proxies API requests:

```
real.sensorcensor.xyz → (shared nginx) → client:80
                                    ├── /              → serves React SPA
                                    └── /api/*         → proxy_pass to server:5001

admin.real.sensorcensor.xyz → (shared nginx) → admin:80
                                    └── serves React admin SPA
```

See `nginx.conf` for the exact routing rules.

## Environment Configuration

For information about configuring environment variables (backend connection, debug logging, etc.), see [docs/configuration.md](../docs/configuration.md) in the root directory.

`client/.env.development` is committed with working local defaults, so `npm run dev` needs no setup. For personal overrides (a remote backend, for example) create `client/.env.development.local`.

### Key Environment Variables

Defaults below are the Docker/production build values. Running `npm run dev` on the host uses `client/.env.development` instead (`VITE_BACKEND_DEV_MODE=true`, `VITE_USE_RELATIVE_API=false`, `VITE_API_BASE_DEV=http://localhost:5001`).

| Variable                | Purpose                                    | Default              |
| ----------------------- | ------------------------------------------ | -------------------- |
| `VITE_BACKEND_DEV_MODE` | Use `localhost:5001` for dev               | `false`              |
| `VITE_USE_RELATIVE_API` | Use relative `/api` URLs (for nginx proxy) | `true`               |
| `VITE_API_BASE_PROD`    | Production backend URL                     | `http://server:5001` |
| `VITE_SHOW_HOROSCOPES`  | Show/hide horoscope section                | `true`               |
| `VITE_DEBUG_LOGS`       | Enable console debug logging               | `false`              |
