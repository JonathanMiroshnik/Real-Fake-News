# API Origin, Subdomains, and REST Shape

> **Status:** Discussion / Planned · **Priority:** Low · **Blocks:** nothing today · **Order:** commits 10–12 of the 2026-11-07 session (`plans/README.md`)

## Current topology

- **Production:** an external nginx (PersonalDevOps) owns `devops_shared` and routes
  `real.sensorcensor.xyz` → `client` container; the admin app lives on its own host (for
  example `admin.sensorcensor.xyz`) → `admin` container. Both containers proxy `/api/*` to
  `server:5001` on the private network, so the browser never talks to the API host directly.
- **Dev:** `localhost:5173` (client), `localhost:5174` (admin), `localhost:5001` (the API,
  published straight to the host by the dev overlay).
- `VITE_API_BASE_PROD` is baked at **build** time (`http://server:5001` in the dev overlay,
  a public origin in prod), and `VITE_USE_RELATIVE_API=true` switches the SPA to `/api`.

## How subdomains actually work here

- A subdomain is just a DNS record (A/AAAA, or CNAME) — `admin.example.com` needs its own
  record or a `*.example.com` wildcard, plus a TLS certificate covering the name (SAN list
  or wildcard cert).
- nginx maps a name to a backend with `server_name`, so _many_ subdomains can share one
  nginx and one container network. Routing is a config line, not an architecture.
- **Because each frontend proxies `/api` internally, every app is same-origin with the API.**
  No CORS, no preflights, no `Access-Control-*` headers are needed in production — CORS only
  exists in dev, where the browser talks to `localhost:5173` and the API answers on `:5001`.
  `ALLOWED_ORIGINS`/`CLIENT_URL` therefore exist mainly for the dev/`separate-origin` case.
- Cookies across subdomains need `Domain=.example.com` and a deliberate `SameSite`; the
  current admin auth uses a password in a request body/header, so this does not bite yet.

## Is this REST? Should it be?

Roughly half of it is. `GET /api/blogs/:key`, `GET /api/images/:filename` and
`PUT /api/admin/articles/:key` are REST. These are not:

| Endpoint                           | Problem                                                 | REST-ish form                        |
| ---------------------------------- | ------------------------------------------------------- | ------------------------------------ |
| `/api/blogs/daily`, `/hourly`      | window encoded as a path segment                        | `GET /api/articles?window=day\|hour` |
| `/api/blogs/by-minute?minute=1440` | query param already present, but the path duplicates it | `GET /api/articles?since=1440m`      |
| `/api/blogs/relevant`              | selection logic as a verb path                          | `GET /api/articles?sort=relevant`    |
| `/api/admin/generate/article`      | RPC verb, and it _creates_ a draft                      | `POST /api/admin/article-drafts`     |
| `blogs` vs `articles` vs `posts`   | three names for one resource in routing, DB and types   | pick `articles` end-to-end           |

**Should it be REST?** Not dogmatically. This is a single-consumer, read-mostly API; the value
of REST here is _caching and cache-key honesty_, not resource purism. The parts worth fixing
are the ones that break HTTP caching (per-minute windowing, ETags computed from a mutable
"now") and the naming inconsistency, because those cost real bugs. Admin RPC actions can stay
RPC — they should just say what they create.

## Checklist

- [ ] Keep `/api` relative in every build; never bake a hostname into the SPA bundle
      (`VITE_USE_RELATIVE_API` should be the only mode, prod included)
- [ ] Dev: proxy the API through the client container (`localhost:5173/api`) instead of
      publishing `:5001` and relying on CORS — one origin in dev and prod
- [ ] Collapse `/api/blogs/daily|hourly|by-minute|relevant` into one collection endpoint with
      explicit `window`/`since`/`sort` query parameters
- [ ] Rename the resource to `articles` everywhere (routes, service names, response keys),
      keeping `/api/blogs/:key` as a deprecated alias for one release
- [ ] Rename `POST /api/admin/generate/article` → `POST /api/admin/article-drafts` (and
      `…/recipe-drafts`)
- [ ] Move the admin password out of query params/body into an `Authorization` header
      (prerequisite for any cookie/subdomain story)
- [ ] Make ETags derive from `updatedAt`/content hash, not from the current clock, so a
      feed poll can actually answer `304`
- [ ] Document the origin model in `docs/configuration.md` (one origin per environment,
      nginx owns routing, curl examples for each)

## Notes

- Adding a subdomain is intentionally cheap: DNS record + `server_name` block + cert. It
  should never require an application change.
- If the API ever needs to be public on its own host (`api.example.com`), that is the moment
  CORS, rate limiting and auth headers become first-class — not before.
