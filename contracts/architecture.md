# Contract: Architecture

> Human-authored. Read-only to agents. Facts here override anything an agent infers from the code.

## The three apps are independent

```
client/   React SPA (public site)      ──HTTP──►  server/  Express + TypeScript  ──►  SQLite
admin/    React SPA (admin panel)      ──HTTP──►  server/
```

Each of `client/`, `admin/` and `server/` must be runnable and deployable **on its own** — copy the
folder, give it a `.env`, it works. Consequences agents must respect:

- No imports across the three apps. No shared workspace package. Shared code is duplicated
  deliberately or lives in the server's public API, never in a `common/` folder.
- The client and admin talk to the API over HTTP only, never through the filesystem.
- The server never serves the SPAs; nginx does.

## Data ownership

- **SQLite is the only database.** The server owns the schema and the only connection to it.
- The database file lives on a bind mount (`DATABASE_DIR` → `/data`), images on a second mount
  (`IMAGES_DIR` → `/images`). **Both paths are required** — there are no defaults, and the server
  refuses to boot without them (`MissingPathConfigError`). Never reintroduce a default host folder
  inside the repo.
- No ORM layer that hides the SQL to the point of guessing; migrations are explicit.
- Never commit a `.sqlite` file.

## Content pipeline invariants

1. **One source of mock content.** Dev/seed content and the mock adapters read the same
   `contentSources/mocks/mockContent.ts`. Do not add a second fake-content source.
2. **Content sources are injected ports** (`NewsSource`, `TextGenerator`, `ImageGenerator`,
   `TransitSource`). Jobs must run with `CONTENT_SOURCE=mock` and no API keys; only the live
   adapters may require keys.
3. **Fail closed in production.** With `NODE_ENV=production` and `CONTENT_SOURCE=live`, a database
   containing mock rows must stop the boot with a non-zero exit that names the row count and
   `DATABASE_PATH`. There is no read-time fallback that invents content.
4. **Every persisted row records its `contentSource`.** Resets delete by that marker, never by
   guessing at a `dev-` prefix.

## Configuration

- Configuration is environment variables only, read in `config/`. Adding a config key means
  updating `.env.example`, `server/.env.example`, `docs/configuration.md` and `README.md` in the
  same change — a key that exists in code but not in the docs does not exist.
- `VITE_*` values are baked in at build time; changing one requires a rebuild, not a restart.

## Deployment shape

- Production is Docker Compose on a VPS, behind a shared external nginx network
  (`devops_shared`, declared `external: true`). The containers expose **no host ports** in
  production; the dev overlay is what publishes 5173/5174/5001.
- Container names are `client`, `server`, `admin` — a sibling DevOps repo refers to them by name.
  Do not rename them.
- `proxy_pass` uses `$backend_server$request_uri`. Dropping the `$request_uri` (or using a
  variable-less form) breaks every `/api/*` call. Do not "simplify" it.

## Quality gates

`main` is protected by muscle memory, not by tooling: `npm run format:check`, `npm run lint`,
`npm run typecheck` and `npm test` must pass before work is called done. Tests validate behaviour
at boundaries (API contract, job → DB write), not the internals of a function.
