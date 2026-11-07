# Configuration & app layout

How configuration flows through Real-Fake-News, and how to keep `server/`,
`client/` and `admin/` independent enough to run (or move) on their own.

## TL;DR — which file do I edit?

| What you want to do                         | Edit this                                                                                     |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Run the whole stack in Docker               | **`.env`** at the repo root (single source for Compose)                                       |
| Run the API directly on your machine        | **`server/.env`**                                                                             |
| Run the client SPA directly on your machine | nothing — `client/.env.development` is committed; override in `client/.env.development.local` |
| Run the admin SPA directly on your machine  | nothing — `admin/.env.development` is committed; override in `admin/.env.development.local`   |
| Change a server key for _both_ paths        | root `.env` **and** `server/.env` (same keys, different consumers)                            |

`.env.example` files are the reference for every key; they are never read by any
process, only copied.

## 1. First run

```bash
npm run setup     # = bash scripts/bootstrap.sh
```

The script is idempotent and only ever creates what is missing:

- `.env` (from `.env.example`) and `server/.env` (from `server/.env.example`)
- `database/` — the host directory bind-mounted to `/data` in the server container
- the `devops_shared` Docker network (Compose declares it `external: true`)

It exits non-zero while `DEEPSEEK_API_KEY`, `NEWSDATA_API_KEY`,
`RUNWARE_API_KEY` or `ADMIN_PASSWORD` still hold placeholder values, so a
half-configured deployment never starts.

## 2. How each piece finds its configuration

```
root .env ──interpolated by Compose──► docker-compose.yml ──build args──► client / admin bundles
    └──────env_file──────► server container
server/.env          ──dotenv──► API process on the host
client/.env.development  ──Vite──► client dev server on the host
admin/.env.development   ──Vite──► admin dev server on the host
```

Precedence, low to high:

| Layer       | Order                                                               |
| ----------- | ------------------------------------------------------------------- |
| Compose     | `.env` file → shell environment (shell wins)                        |
| Container   | `Dockerfile ENV` → `env_file:` → `environment:` (later wins)        |
| Vite (host) | `.env` → `.env.[mode]` → `.env.local` → `.env.[mode].local` → shell |

Two consequences that bite in practice:

1. **`docker-compose.yml`'s `environment:` block wins over `env_file:`.** A key
   hardcoded there cannot be overridden from `.env`. Only deployment topology
   (`PORT`, `NODE_ENV`, `DATABASE_PATH`) is pinned that way on purpose.
2. **`VITE_*` values are baked into the JS bundle at build time.** They are
   public, and changing one requires `docker compose build client admin`.

### Why the backend keys appear in two files

No application code reads the root `.env` — no `dotenv` call points at it.
Compose reads it twice, at two different moments:

| Read                  | When                                 | Effect                                       |
| --------------------- | ------------------------------------ | -------------------------------------------- |
| `${VAR}`, `${VAR:-x}` | `docker compose …` runs, on the host | filled into the YAML before containers exist |
| `${VAR:?message}`     | same moment                          | aborts with the message if unset/empty       |
| `env_file: .env`      | container start, at runtime          | injects **every** key into the container     |

Interpolation happens before any container exists, and a service's `env_file` is
invisible to it. So the `${DEEPSEEK_API_KEY:?…}` guards can only be satisfied
from the root `.env` (or your shell) — that alone is why those four keys live
there as well as in `server/.env`. The duplication is not needed for the values
to reach the container: `env_file: .env` already delivers all of them.

Two consistent ways to remove the duplication:

- **Docker only** — keep the guards and the keys in the root `.env`, delete
  `server/.env` (it exists solely for host runs).
- **One file** — `env_file: - server/.env` on the server service, drop the `:?`
  guards (Compose cannot validate a file it never reads), and let the server
  fail fast at boot on missing keys instead.

## 3. Docker

```bash
# Local containerised dev (publishes 5001 / 5173 / 5174, no background jobs)
npm run docker:dev          # = docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
npm run docker:dev:logs     # follow the API container
npm run docker:dev:down     # stop, keep your DATABASE_DIR/IMAGES_DIR contents

# Production-like (no host ports, shared VPS network)
npm run docker:prod         # = docker compose up --build -d
npm run docker:down
```

Both require the root `.env` (Compose errors out with `cp .env.example .env` until
the four required keys are filled). `npm run setup` creates the `.env` files, the
data directory and the production `devops_shared` network.

The **dev overlay needs no preparation at all**: it swaps `devops_shared` for a
project-local network (`rfnews-dev`) that Compose creates and removes by itself.
Only production joins the shared VPS network, because only production sits behind
the PersonalDevOps nginx.

Then open:

| App    | URL                              |
| ------ | -------------------------------- |
| client | http://localhost:5173            |
| admin  | http://localhost:5174            |
| API    | http://localhost:5001/api/health |

Anything unclear? `docker compose ps` for state, `npm run docker:dev:logs` for the
API log, `docker compose logs client` when a SPA page is blank (a 502 from nginx
means the `server` container is not up yet, or failed on a missing key).

The dev overlay sets `ENABLE_SCHEDULED_JOBS=false` on purpose: background jobs
call paid APIs (DeepSeek, NewsData, Runware). To exercise them locally, comment
that line out or run the API on the host with `ENABLE_SCHEDULED_JOBS=true`.

Build contexts are per app (`./server`, `./client`, `./admin`), so no image
build needs the rest of the repo:

```bash
cd server && docker build -t rfnews-server .
cd client && docker build -t rfnews-client .
cd admin  && docker build -t rfnews-admin .
```

### Where the data lives (SQLite + images)

The app writes two things: the database (`database.db` plus its SQLite side files
`-wal`, `-shm`) and an `images/` directory (one original + one compressed copy per
article). Each has its own host directory, and each can live on a different disk.
Compose bind-mounts them at `/data` and `/images` inside the container:

```bash
DATABASE_DIR=/var/lib/rfnews                    # absolute: any path, any disk
# DATABASE_DIR=./database                       # inside the repo (gitignored)

IMAGES_DIR=/mnt/big-disk/rfnews-images          # images on their own disk
# IMAGES_DIR=./database/images                  # or next to the database
```

**Both are required — neither has a default.** `docker compose up` aborts with
`DATABASE_DIR missing - set the host database directory in .env` if either is
unset, which is deliberate: a silent default used to drop a `database/` folder
inside the repo. `npm run setup` checks the same two values first.

Only Compose reads these two. Inside the container the API always uses
`DATABASE_PATH=/data/database.db` and `IMAGES_PATH=/images`, so relocating data
never requires a code or image change — just the mount. Image _URLs_ do not change
either: they are served by `GET /api/images/:filename`, never from a raw path.

Why split them? The database is small (a few MB) and wants an SSD; images are the
bulk of the disk usage and can sit on cheap storage, or get their own quota or
backup cycle. Pointing `IMAGES_DIR` at `<DATABASE_DIR>/images` keeps them together,
which is what most installs do.

Moving an existing dataset (stop first: SQLite has `-wal`/`-shm` side files):

```bash
docker compose down
mkdir -p /var/lib/rfnews
rsync -a ./database/ /var/lib/rfnews/            # database.db + -wal + -shm
rsync -a ./database/images/ /mnt/big-disk/rfnews-images/   # only if splitting
sed -i 's#^DATABASE_DIR=.*#DATABASE_DIR=/var/lib/rfnews#' .env
echo 'IMAGES_DIR=/mnt/big-disk/rfnews-images' >> .env      # only if splitting
docker compose up -d
```

Host-run API (no Docker)? Then `DATABASE_DIR`/`IMAGES_DIR` are irrelevant — set
`DATABASE_PATH` and `IMAGES_PATH` in `server/.env` instead, absolute:
`DATABASE_PATH=/var/lib/rfnews/database.db`,
`IMAGES_PATH=/mnt/big-disk/rfnews-images`. Relative values resolve against
`server/`, never against your shell's cwd (`server/src/config/paths.ts`); the
example file ships `../database/database.db` + `../database/images`.

**These two have no defaults either.** `server/src/config/paths.ts` throws
`MissingPathConfigError` when either is unset or blank, so a host run fails at
startup instead of creating a `database/` folder in the repo. `server/.env` is
loaded relative to the source file (`server/src/config/env.ts`), so every
entrypoint — `npm run dev`, `node dist/index.js`, the `tsx` scripts — behaves the
same from any working directory.

The server container runs as **root**, so files it creates in those directories are
root-owned on the host; removing them later needs `sudo`.

## 4. Running the apps directly on the host

```bash
# terminal 1 — API (port 5001, loads server/.env)
cd server && npm install && npm run dev

# terminal 2 — client SPA (port 5173, loads client/.env.development)
cd client && npm install && npm run dev

# terminal 3 — admin SPA (port 5174, loads admin/.env.development)
cd admin && npm install && npm run dev
```

`client/.env.development` and `admin/.env.development` are committed and contain
no secrets. They exist so that a fresh clone talks to `http://localhost:5001`
instead of silently falling back to the production API — the fallback in
`client/src/config/apiConfig.ts` and `admin/src/api/apiConfig.ts` is
`https://real.sensorcensor.xyz` whenever `VITE_BACKEND_DEV_MODE` is undefined.

## 5. Variable reference

### server (`server/.env` or root `.env`)

| Key                              | Required | Default                       | Notes                                                 |
| -------------------------------- | -------- | ----------------------------- | ----------------------------------------------------- |
| `DEEPSEEK_API_KEY`               | yes      | —                             | article text generation                               |
| `NEWSDATA_API_KEY`               | yes      | —                             | real news fetching                                    |
| `RUNWARE_API_KEY`                | yes      | —                             | AI image generation                                   |
| `ADMIN_PASSWORD`                 | yes      | `changeme123` (code fallback) | admin panel login                                     |
| `PORT`                           | no       | `5001`                        | internal only                                         |
| `DATABASE_PATH`                  | yes      | —                             | SQLite file; Docker pins `/data/database.db`          |
| `DATABASE_DIR`                   | yes      | —                             | host dir mounted at `/data` (compose only)            |
| `IMAGES_PATH`                    | yes      | —                             | images dir; Docker pins `/images`                     |
| `IMAGES_DIR`                     | yes      | —                             | host dir mounted at `/images` (compose only)          |
| `CLIENT_URL`                     | no       | built-in defaults             | CORS + absolute links                                 |
| `ALLOWED_ORIGINS`                | no       | —                             | extra CORS origins, comma-separated                   |
| `ENABLE_SCHEDULED_JOBS`          | no       | `false`                       | cron: news fetch + article writing                    |
| `ENABLE_FAKE_DATA`               | no       | `false`                       | placeholder content when DB empty (dev: seed instead) |
| `DEBUG_LOGS`                     | no       | `false`                       | verbose server logging                                |
| `RUNWARE_IMAGE_MODEL`            | no       | `runware:z-image@turbo`       | image model                                           |
| `JWT_SECRET`, `GOOGLE_CLIENT_ID` | no       | —                             | reserved, only read by helpers                        |
| `FAKE_IMAGE_*`                   | no       | see example                   | placeholder image generator                           |

### client / admin (`.env.development`, root `.env`, or build args)

| Key                                 | Default (prod / dev)               | Notes                                  |
| ----------------------------------- | ---------------------------------- | -------------------------------------- |
| `VITE_USE_RELATIVE_API`             | `true` / `false`                   | `true` = nginx proxies `/api`          |
| `VITE_BACKEND_DEV_MODE`             | `false` / `true`                   | `true` = use `VITE_API_BASE_DEV`       |
| `VITE_API_BASE_DEV`                 | `http://localhost:5001`            | host-run backend                       |
| `VITE_API_BASE_PROD`                | `http://server:5001`               | container/DNS name                     |
| `VITE_DEBUG_LOGS`                   | `false` / `true`                   | browser console logging                |
| `VITE_SHOW_HOROSCOPES`              | `true`                             | homepage flag                          |
| `VITE_SHOW_RECIPES`                 | `true`                             | homepage flag                          |
| `VITE_ARTICLES_CACHE_EXPIRATION_MS` | `600000`                           | client cache lifetime                  |
| `VITE_FRONTEND_DEV_MODE`            | `false` / `true` (admin)           | pick client URL for article links      |
| `VITE_CLIENT_URL_DEV` / `_PROD`     | `http://localhost:5173` / site URL | admin only                             |
| `VITE_PORT`                         | `5174` (admin)                     | Vite dev server port                   |
| `VITE_LOCAL_DEV_MODE`               | —                                  | **deprecated** alias of the flag above |

## 6. Keeping the three apps independent

The layout follows four rules:

1. **No app reads a file outside its own directory.** `server/.env`, `client/.env*`
   and `admin/.env*` live next to the app that consumes them; the root `.env` is
   read by Compose only.
2. **Each app builds from its own context.** `server/Dockerfile`,
   `client/Dockerfile` and `admin/Dockerfile` only reference paths inside their own
   folder, each with its own `.dockerignore`.
3. **Paths resolve from the source file, never from `process.cwd()`.**
   `server/src/config/env.ts` loads `server/.env` relative to itself (and is
   imported first, before anything reads `process.env`), and
   `server/src/lib/database/database.ts` resolves `DATABASE_PATH` (required, no
   default) the same way — so `node dist/index.js` behaves identically from any
   directory.
4. **Links between apps are URLs from the environment,** never imports. The one
   build-time coupling left is `proxy_pass` in `client/nginx.conf` and
   `admin/nginx.conf`, which hardcodes the Compose service name `server:5001`.

### Moving an app out of this repo

**server/** — copy the folder, then:

```bash
cd server && npm ci
# point at your own database, images and origins (all required from here on):
echo 'DATABASE_PATH=/srv/realfakenews/database.db' >> .env
echo 'IMAGES_PATH=/srv/realfakenews/images' >> .env
echo 'CLIENT_URL=https://your-frontend.example.com' >> .env
echo 'ALLOWED_ORIGINS=https://admin.your-frontend.example.com' >> .env
npm run build && npm start          # listens on $PORT (5001)
```

It needs the three API keys, `ADMIN_PASSWORD` and a writable `DATABASE_PATH` +
`IMAGES_PATH` (no defaults — it exits with `MissingPathConfigError` otherwise).
Nothing else from this repo is required.

**client/** or **admin/** — copy the folder, then:

```bash
npm ci
# host build: VITE_BACKEND_DEV_MODE=false, VITE_USE_RELATIVE_API=false,
#             VITE_API_BASE_PROD=https://your-api.example.com
npm run build                       # static output in dist/ (client) or build/ (admin)
```

Any static host works. Two caveats: `VITE_*` values must be present at build time,
and `VITE_USE_RELATIVE_API=true` only works behind a proxy that maps `/api`, so
point the SPA at an absolute API URL unless you bring your own nginx.

### What still ties them together

| Link                  | Where                                                         | How to change it                                     |
| --------------------- | ------------------------------------------------------------- | ---------------------------------------------------- |
| SPA → API origin      | `VITE_API_BASE_PROD` / `VITE_USE_RELATIVE_API`                | root `.env`, then rebuild                            |
| nginx → API           | `proxy_pass` in `client/nginx.conf`, `admin/nginx.conf`       | edit the upstream, or keep the service name `server` |
| API → allowed origins | `ALLOWED_ORIGINS` / `CLIENT_URL`                              | root `.env`, restart                                 |
| admin → article links | `VITE_CLIENT_URL_DEV` / `VITE_CLIENT_URL_PROD`                | root `.env`, then rebuild                            |
| API → data            | `DATABASE_DIR` + `IMAGES_DIR` (mounted at `/data`, `/images`) | root `.env` + volumes                                |

## 7. Gotchas

- **`devops_shared` must exist for production** (`docker compose up`); `npm run setup`
  creates it. `external: true` is the _only_ reason Compose will not create it for
  you. Dev mode does not need it: the overlay uses `rfnews-dev`, created and removed
  by Compose automatically.
- **`DATABASE_DIR` and `IMAGES_DIR` have no defaults** — Compose fails on a
  missing value rather than writing a `database/` folder into the repo. They must
  also exist and be writable: if Docker creates them, they are root-owned and you
  need `sudo` to delete them.
- **`IMAGES_PATH`/`DATABASE_PATH` are container-internal.** Setting them to a host
  path in the root `.env` has no effect on the containers — the host side of the
  mount is `IMAGES_DIR`/`DATABASE_DIR`. (`IMAGES_PATH`/`DATABASE_PATH` in
  `server/.env` are for running the API on the host, where no mount exists, and
  the server refuses to start without them.)
- **Changing a `VITE_*` value needs a rebuild**, not a restart.
- **The root `.env` is also the server's `env_file`**, so the inert `VITE_*` keys show
  up in the container environment. They are public and unused there; that is the
  price of a single root file.
- **`ADMIN_PASSWORD` has a `changeme123` fallback in code.** Always set it.
- **Dev content is seeded, not generated on read.** `npm run seed:dev` (or the
  one-shot `seed` service in `docker-compose.dev.yml`) writes rows with
  `dev-…` keys plus real placeholder images; `npm run seed:reset` removes exactly
  those. The old `npm run seed` / `npm run generate-mock-data` scripts are gone —
  both read `server/data/`, which no longer exists.
- **Unknown `VITE_*` names are silently ignored.** Vite only inlines declared keys,
  so a typo becomes `undefined` at runtime instead of an error.
