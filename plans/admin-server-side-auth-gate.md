# Server-Side Admin Auth Gate

> **Status:** Planned
> **Priority:** High (Security)
> **Ticket Goal:** Prevent the admin frontend (HTML/JS/CSS bundle) from being served at all unless the correct password is provided.

---

## Problem

The admin panel currently protects **data** via server-side password validation on all API endpoints, but the **frontend application itself** (the entire React SPA bundle) is served to anyone who visits the admin URL — regardless of whether they know the password.

This means anyone can:
- View the admin panel's HTML, JavaScript, and CSS source code
- Understand the internal routing structure (Dashboard, Settings, ArticleEditor)
- See the API endpoints and how the frontend calls them
- Reverse-engineer the admin panel's functionality

The frontend layer (`Dashboard.tsx`) shows an "Access Denied" message when no password is provided, but the bundle has already been fully downloaded and executed by the browser at that point.

## Goal

The Express backend server should **validate the password before serving any admin frontend files**. If the password is missing or incorrect, the server returns a minimal `401 Unauthorized` response (a single line of text or a barebones HTML page) — no admin SPA code is transmitted.

---

## Current Architecture

```
┌─ User Browser ─────────────────────┐
│  admin.real.sensorcensor.xyz/?pwd=X │
└──────────┬──────────────────────────┘
           │
           ▼
┌── Admin Container (nginx:80) ──────────────┐
│  location / {                              │
│    try_files $uri $uri/ /index.html        │
│  }                                         │
│  location /api { proxy_pass → server:5001 } │
│  ───────────────────────────────────────── │
│  ▶ Serves admin SPA static files directly  │
│  ▶ No password check at this level         │
└────────────────────────────────────────────┘
           │
           ▼
┌── Server Container (Express:5001) ──────┐
│  /api/admin/*  ← password validated here │
│  (API data is protected)                 │
└──────────────────────────────────────────┘
```

**Problem:** The top arrow (serving admin SPA) has no auth check. Anyone gets the full frontend.

---

## Proposed Solution

Have the **Express server** serve the admin SPA's static files behind a password-checking middleware. The admin container's nginx proxies all requests through the server instead of serving files directly.

### New Architecture

```
┌─ User Browser ────────────────────────────┐
│  admin.real.sensorcensor.xyz/?pwd=X        │
└──────────┬─────────────────────────────────┘
           │
           ▼
┌── Admin Container (nginx:80) ───────────────┐
│  location / {                               │
│    proxy_pass http://server:5001/admin-panel │
│  }                                          │
│  (No longer serves static files directly)   │
└──────────┬──────────────────────────────────┘
           │  (query params forwarded automatically)
           ▼
┌── Server Container (Express:5001) ─────────────────┐
│                                                     │
│  app.use('/admin-panel', adminAuth, express.static) │
│                                                     │
│  ┌─ adminAuth middleware ──────────────────┐        │
│  │  req.query.pwd === ADMIN_PASSWORD?      │        │
│  │    YES → next()  (serve static files)   │        │
│  │    NO  → res.status(401).send(...)      │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  /api/admin/*  ← password still validated here too  │
└─────────────────────────────────────────────────────┘
```

### How It Works

1. User visits `admin.real.sensorcensor.xyz/?pwd=secret`
2. Admin nginx proxies the request (with `?pwd=secret` forwarded) to `http://server:5001/admin-panel/?pwd=secret`
3. Express `adminAuth` middleware checks `req.query.pwd` against `ADMIN_PASSWORD`
4. If valid → serve admin SPA static files (HTML/JS/CSS) normally
5. If invalid → return `401 Unauthorized` with a minimal response — **no admin frontend code is transmitted**
6. Internal SPA navigation preserves `?pwd=` in the URL so API calls continue to work

---

## Files to Create / Modify

### New Files

| File | Purpose |
|---|---|
| `server/src/middleware/adminAuth.ts` | Middleware that checks `pwd` query param against `ADMIN_PASSWORD` before allowing access to admin static files |

### Modified Files

| File | Change |
|---|---|
| `server/src/app.ts` | Mount admin static files at `/admin-panel` with the auth middleware; add catch-all for SPA routing |
| `admin/nginx.conf` | Change from serving static files to proxying all requests through the server |
| `admin/src/pages/Dashboard.tsx` | Remove frontend-side `isAuthorized`/Access Denied check (server now gates entirely) |
| `admin/src/api/adminApi.ts` | Remove dev-mode password fallback (`getPassword()` should only read from URL) |
| `server/Dockerfile` | Add multi-stage build for admin, or copy pre-built admin files into server image |
| `docker-compose.yml` | Update admin service; possibly remove separate admin container |
| `client/nginx.conf` | Update `/admin` proxy to point to server instead of admin container |
| `admin/README.md` | Update security notes to reflect server-side gating |

---

## Implementation Details

### 1. Auth Middleware (`server/src/middleware/adminAuth.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const password = (req.query.pwd as string) || (req.query.password as string);
  const expectedPassword = process.env.ADMIN_PASSWORD || 'changeme123';

  if (password === expectedPassword) {
    return next();
  }

  // In development, also accept 'debug' for easier testing
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  if (isDevelopment && password === 'debug') {
    return next();
  }

  // Check if this looks like an API call (Accept header) or a page request
  const isApiRequest = req.accepts('html') === false;

  if (isApiRequest) {
    res.status(401).json({ error: 'Unauthorized: invalid or missing password' });
  } else {
    res.status(401).type('html').send(`
      <!DOCTYPE html>
      <html><head><title>Access Denied</title></head>
      <body style="font-family:sans-serif;display:flex;justify-content:center;
            align-items:center;height:100vh;margin:0;background:#1a1a2e;color:#eee;">
        <div style="text-align:center;">
          <h1 style="font-size:3rem;margin-bottom:0.5rem;">🔒</h1>
          <h1>Access Denied</h1>
          <p>This admin panel requires a valid password.</p>
          <p style="color:#888;font-size:0.85rem;">
            Add <code>?pwd=YOUR_PASSWORD</code> to the URL.
          </p>
        </div>
      </body></html>
    `);
  }
}
```

### 2. Express Static Serving (`server/src/app.ts`)

```typescript
import path from 'path';
import express from 'express';
import { adminAuth } from './middleware/adminAuth.js';

// Serve admin SPA files behind password authentication
const adminBuildPath = path.resolve(process.env.ADMIN_BUILD_PATH || '../admin/build');
app.use('/admin-panel', adminAuth, express.static(adminBuildPath));

// Catch-all for SPA client-side routing (preserve ?pwd= for internal navigation)
app.get('/admin-panel/*', adminAuth, (req, res) => {
  res.sendFile(path.join(adminBuildPath, 'index.html'));
});
```

### 3. Admin Nginx Config (`admin/nginx.conf`)

```nginx
server {
    listen 80;
    server_name _;

    # Proxy ALL requests through the server for password authentication
    location / {
        proxy_pass http://server:5001/admin-panel/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API requests still go directly to the server
    location /api {
        proxy_pass http://server:5001/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Frontend Cleanup (`admin/src/pages/Dashboard.tsx`)

Remove the frontend-side auth gate since the server now handles it:

```typescript
// Remove these lines:
// const isAuthorized = password !== '';
// if (!isAuthorized) { return ( <div className=\"unauthorized\"> ... ); }
```

The `password` extraction from URL search params can remain since it's used for preserving the `?pwd=` parameter in internal navigation links.

### 5. API Layer (`admin/src/api/adminApi.ts`)

Remove the dev-mode fallback in `getPassword()`:

```typescript
function getPassword(): string {
  const params = new URLSearchParams(window.location.search);
  const urlPassword = params.get(ADMIN_PASSWORD_PARAM);
  if (urlPassword !== null) return urlPassword;
  // Remove dev fallback:
  // const isDev = import.meta.env.VITE_FRONTEND_DEV_MODE === 'true' || ...
  // return isDev ? 'changeme123' : '';
  return '';
}
```

---

## DevOps / Pipeline Impact

The following changes affect deployment and must be coordinated with the DevOps pipeline:

### Docker Image Build

| Current | After Change |
|---|---|
| `admin/Dockerfile` builds admin SPA independently | Admin SPA must be built and its output available in the server container |
| `server/Dockerfile` only builds server code | `server/Dockerfile` needs a multi-stage build that compiles admin, OR admin build must happen as a separate step and output is copied into server image |

### Options for Admin Build Integration

**Option A (Recommended): Merge admin into server Dockerfile**
- Add a build stage in `server/Dockerfile` that compiles the admin SPA
- Copy admin build output into the server image at a known path (e.g., `/app/admin-build/`)
- Requires admin build dependencies (node, npm) in the server build stage
- Removes need for a separate admin container

**Option B: Keep separate admin container as proxy**
- Admin container remains but becomes a thin nginx proxy (no static files)
- Admin SPA is built separately and the build output is mounted/copied into the server container
- More complex volume management

**Option C: Build admin externally, inject at deploy time**
- CI/CD builds admin SPA separately
- The build output is baked into the server image during docker build (e.g., `COPY --from=admin-builder`)
- Requires coordinated builds

### Docker Compose Changes

The `admin` service in `docker-compose.yml` may need to be:
- Kept but simplified (thin proxy only)
- Removed entirely (with `/admin` routing in `client/nginx.conf` pointing to `server:5001/admin-panel/`)

### Nginx Routing

| File | Current | After |
|---|---|---|
| `client/nginx.conf` location `/admin` | `proxy_pass http://admin:80` | `proxy_pass http://server:5001/admin-panel/` (if admin container removed) |
| `admin/nginx.conf` | Serves static files | Proxies to server |
| devops-nginx (external) | Routes `admin.*.xyz → admin:80` | No change needed (still routes to admin container) |

### Environment Variables

No new environment variables are needed. `ADMIN_PASSWORD` is already set on the `server` service in `docker-compose.yml`. The pipeline must ensure:
- `ADMIN_PASSWORD` continues to be passed to the `server` container ✅ (already done)
- `ADMIN_BUILD_PATH` may be needed if the admin build location differs from default

---

## Testing Strategy

1. **Unit test**: Test `adminAuth` middleware with valid password, invalid password, missing password, and development mode
2. **Integration test**: Verify Express serves admin static files when password is valid
3. **Integration test**: Verify Express returns 401 with minimal response when password is invalid
4. **E2E test**: Visit `/?pwd=wrong` and confirm no React app is served (check response body does not contain React-specific strings like `root`, `__vite`, etc.)
5. **E2E test**: Visit `/?pwd=correct` and confirm admin SPA loads normally
6. **Navigation test**: Verify internal SPA navigation (Dashboard → ArticleEditor) preserves `?pwd=` in URL
7. **API test**: Verify admin API endpoints still work with `?password=` query param

---

## Security Considerations

- **Before (current):** Security through obscurity + API-level validation. Frontend bundle is public.
- **After:** True server-side access control. Unauthorized users receive zero frontend code.
- The server-side auth is a simple password comparison — for production, consider rate-limiting the auth endpoint to prevent brute-force attacks.
- The password is transmitted as a URL query parameter — in production, ensure HTTPS is enforced (already the case).
- Consider adding a log event for failed admin access attempts.

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| No `?pwd=` parameter | 401 — minimal "Access Denied" page |
| Wrong password | 401 — minimal "Access Denied" page |
| Correct password | Full admin SPA loads normally |
| Direct access to JS file with correct pwd (`/assets/index.js?pwd=correct`) | File is served (auth passes) |
| Direct access to JS file without pwd (`/assets/index.js`) | 401 (auth fails) |
| Admin API call with valid password (`/api/admin/articles?password=correct`) | Works as before |
| Admin API call without password (`/api/admin/articles`) | 401 as before |
| Internal SPA route (`/articles/edit/abc123?pwd=correct`) | Server serves `index.html` (SPA catch-all), React handles routing |
| Development mode with `?pwd=debug` | Works (same as current behavior) |

---

## Alternative Approaches Considered

### 1. Frontend-Only Obfuscation (Rejected)
- Inline script in `index.html` that checks `?pwd=` before React loads
- **Problem:** The bundle is still downloaded, just not rendered. Source code is still visible in DevTools.

### 2. Nginx `auth_request` Module (Rejected)
- Nginx's `auth_request` makes a subrequest to the backend before serving files
- **Problem:** Requires nginx compiled with `ngx_http_auth_request_module`; adds complexity; breaks SPA catch-all routing

### 3. Separate Auth Proxy Container (Rejected)
- A dedicated lightweight auth proxy sits between nginx and the admin SPA
- **Problem:** Another container to maintain; adds network hop

### 4. Merge Admin into Client SPA (Rejected)
- Serve admin as a protected route within the main client React app
- **Problem:** Exposes admin routes to all users; couples the public site with admin code

### 5. JSON Web Token (JWT) Authentication (Future Enhancement)
- Instead of URL query param password, use a proper login flow with JWT
- **Problem:** Scope creep — this ticket is about gating the frontend bundle, not rewriting auth
- **Consider for V2:** A login page that issues a JWT stored in a cookie, checked by the server before serving admin files

---

## Progressive Enhancement Path

This feature can be implemented in stages:

### Phase 1 (Minimum Viable)
- Create auth middleware
- Serve admin static files through Express
- Update admin nginx to proxy through server
- Remove frontend-side auth check

### Phase 2 (DevOps Integration)
- Update Dockerfiles and docker-compose for new architecture
- Update CI/CD pipeline for coordinated builds

### Phase 3 (Future)
- Rate-limiting on auth endpoint
- JWT-based authentication
- Session management
- Audit logging of admin access
