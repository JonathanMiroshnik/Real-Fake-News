# Contract: Architecture
 
> Human-authored. Read-only to agents. Facts here override anything an agent infers from the code.

## Three independet apps:
- Client - Main client-facing front-end.
- Server - Backend of the website.
- Admin - The admin panel for the website.

Each of `client/`, `admin/` and `server/` must be runnable and deployable **on its own** — copy the
folder, give it a `.env`, it works. Consequences agents must respect:

- No imports across the three apps. No shared workspace package. Shared code is duplicated
  deliberately or lives in the server's public API, never in a `common/` folder.
- The client and admin talk to the API over HTTP only, never through the filesystem.
- The server never serves the SPAs; nginx does.

## Producer-Consumer model:
The Server backend produces content(Meaning, adds data, SQL rows and/or assets such as images) by two main actions:
1. CRON activate some sort of pipeline.
2. Admin panel triggers something with manually.

The producer pipelines should follow a similar structure until a certain point where their specific differences
in the mediums of the data created differentiates them enough.
Producing an article or a horoscope or any other piece of content should follow a pipeline of such a structure:
Trigger -> Specific media creation class -> Business logic that calls one or various service classes ->
Data saved in SQL/Assets/Images

Then, on the consumer side, ultimately the client of the frontend will send a REST request to the backend.
The routes that are avaliable to the client will NOT be able to trigger any of the producer pipelines.

-------------------------------------------------------------------------------------------------------------

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

## Quality gates

`main` is protected by muscle memory, not by tooling: `npm run format:check`, `npm run lint`,
`npm run typecheck` and `npm test` must pass before work is called done. Tests validate behaviour
at boundaries (API contract, job → DB write), not the internals of a function.
