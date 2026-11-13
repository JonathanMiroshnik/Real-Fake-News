**REAL FAKE NEWS**

> **Agents: start at [`AGENTS.md`](AGENTS.md).** It points you at `contracts/` — the human-authored,
> read-only files that state what this repo is. Read them before you plan or edit anything.

A satirical fake news website where all content is AI-generated — articles, recipes, horoscopes, and images. Built with Express/TypeScript backend, React frontend, and SQLite database.

To install Docker on Linux, I used the following tutorial:
https://linuxiac.com/how-to-install-docker-on-pop-os-22-04/

# VPS Production Deployment (real.sensorcensor.xyz)

This repo is deployed on a VPS alongside the PersonalDevOps infrastructure. The shared nginx reverse proxy (`devops-nginx`) handles SSL termination and routes `real.sensorcensor.xyz` to the `client` container. See `docker-compose.yml` for the exact service definitions.

### Architecture

```
real.sensorcensor.xyz → (shared nginx) → client:80
                                  ├── /        → serves static React SPA
                                  └── /api/*   → reverse-proxy to server:5001

admin.real.sensorcensor.xyz → (shared nginx) → admin:80
                                  └── serves static React admin SPA
```

### Getting the VPS IP

To resolve the VPS IP address from your local machine:

```bash
getent hosts api.sensorcensor.xyz
```

This uses the system's configured name resolution (DNS, `/etc/hosts`, etc.) to look up the IP — no extra tools needed.

### Container Names (for PersonalDevOps sites.yaml)

```yaml
- name: 'real'
  subdomain: 'real.sensorcensor.xyz'
  internal_port: 80
  container_name: 'client'
  backend_repo: 'https://github.com/JonathanMiroshnik/RealWebsite.git'
  backend_tech: 'multi'
  enabled: true

- name: 'admin'
  subdomain: 'admin.real.sensorcensor.xyz'
  internal_port: 80
  container_name: 'admin'
  backend_repo: 'https://github.com/JonathanMiroshnik/RealWebsite.git'
  backend_tech: 'multi'
  enabled: true
```

## Environment Configuration

Everything about configuration — which file to edit, precedence rules, and how to
run each app on its own — lives in **[`docs/configuration.md`](docs/configuration.md)**.

Short version:

| What you want to do                         | File                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| Run the whole stack in Docker               | **`.env`** at the repo root (copy `.env.example`)                              |
| Run the API directly on your machine        | **`server/.env`** (copy `server/.env.example`)                                 |
| Run the client / admin SPAs on your machine | nothing — `client/.env.development` and `admin/.env.development` are committed |

Required keys: `DEEPSEEK_API_KEY`, `NEWSDATA_API_KEY`, `RUNWARE_API_KEY` and
`ADMIN_PASSWORD`.

# Running the Application

## Prerequisites

1. **Docker and Docker Compose** installed on your system
2. **Bootstrap the repo** — creates `.env`, `server/.env`, the data directories
   (`DATABASE_DIR`, `IMAGES_DIR`) and the `devops_shared` Docker network:
   ```bash
   npm run setup
   ```
3. **Fill in the API keys** in `.env` and re-run `npm run setup` until it passes.

## Local Development

**Use the dev overlay for testing on your dev machine.** It adds port mappings so you can access services from your browser.

```bash
docker compose up --build -d     # dev — docker-compose.override.yml merges automatically
docker compose logs -f server    # follow the API log
docker compose down              # stop (the data directory stays on disk)

# Access:
#   Client SPA:    http://localhost:5173
#   Admin panel:   http://localhost:5174
#   API directly:  http://localhost:5001/api/health
```

Stock Compose commands, no wrapper and no `-f` flags. When something "does
nothing" and the reason is not obvious, run the doctor:

```bash
npm run doctor           # docker CLI, Compose v2, daemon + socket, .env, data dirs
npm run doctor:deep      # + prove /data and /images are writable inside a container
npm run doctor:status    # container states + seed log + write probe (changes nothing)
```

The stack is defined by `docker-compose.yml` (base) and
`docker-compose.override.yml` (dev overlay: published ports, project-local
network, no background jobs). Compose merges the override automatically because
of its filename, so plain `docker compose up -d` gives you the dev stack and
`docker compose -f docker-compose.yml up -d` gives you production. Full runbook:
[`docs/configuration.md` §3](docs/configuration.md).

### Startup Order & Nginx DNS Resolution

The `client` and `admin` containers depend on `server` (via `depends_on`), so Docker starts the API first. However, nginx resolves upstream hostnames at startup, which can fail if `server` isn't fully ready yet.

Both nginx configs use Docker's internal DNS resolver (`127.0.0.11`) with runtime variable substitution, so nginx will automatically re-resolve the `server` hostname at request time. This prevents the `host not found in upstream` error during container startup races.

On the VPS, no ports are exposed — only the shared nginx serves traffic on 80/443 (the `docker-compose.override.yml` file is absent, so only the production config applies).

## Production VPS Deployment

```bash
# The DevOps pipeline runs:
docker compose up --build -d

# No ports exposed — only the shared nginx serves traffic on 80/443
```

## Common Tasks

### Rebuild After Code Changes

**Development:**

```bash
docker compose build --no-cache client
docker compose up -d client
```

**Production:**

```bash
docker compose build --no-cache client
docker compose up -d client
```

### View Service Logs

**Development:**

```bash
docker compose logs -f server
docker compose logs -f client
```

**Production:**

```bash
docker compose logs -f server
docker compose logs -f client
```

### Check Service Status

```bash
docker compose ps
# or for development:
docker compose ps
```

### Stop All Services

**Development:**

```bash
docker compose down
```

**Production:**

```bash
docker compose down
```

### Seed Dev Content

The dev overlay starts a one-shot `seed` service, so ``docker compose up` gives you
a populated site. The same seeder runs on the host when you develop without Docker:

```bash
cd server
npm run seed:dev        # insert anything missing (idempotent)
npm run seed:reset      # delete the seeded rows + images, then re-insert
```

**Or from inside the containers:**

```bash
docker compose exec server npm run seed:dev
docker compose exec server npm run seed:dev -- --reset
```

**Options:**

- `--reset`: Delete previously seeded rows and their images before writing
- `--force`: Overwrite rows that already exist (default: skip them)
- `--seed <n>`: PRNG seed for the placeholder images (default: fixed → byte-identical output)
- `--help, -h`: Show help

**Examples:**

```bash
# Seed everything that is missing
npm run seed:dev

# Rewrite the seeded content from scratch
npm run seed:dev -- --reset

# Same content, different placeholder images
npm run seed:dev -- --seed 42
```

What it writes: 5 writers, 20 articles (spread over the last week), 15 news items,
10 recipes, 5 food names and today's 12 horoscopes — plus a real placeholder PNG
per writer/article/recipe under `IMAGES_PATH` (original + compressed copy).

The content lives in `server/src/services/contentSources/mocks/` as typed
TypeScript, not JSON or a committed database: a schema change becomes a compile
error, and review shows exactly what a new article says. Rows are keyed `dev-…`,
which is what makes a second run a no-op and `--reset` precise.

The seeder refuses to run with `NODE_ENV=production` unless **both** `--force` and
`--i-know-this-is-a-demo` are passed.

## No Read-Time Fake Content

The API never invents content while answering a request. An empty database
answers `200` with an empty list (`{ "posts": [], "error": "" }`); a key that is
not there is a `404`; a date with no featured article is
`{ "success": false, "article": null }`. Whatever the response body says is
what is on disk.

This was not always true. Until roadmap entry 7 of the
[`plans/`](plans/README.md) work the controllers could generate satirical
placeholder articles, recipes and horoscopes at read time behind an
`ENABLE_FAKE_DATA` flag. The flag and the generators are gone:
guarding a fallback means the fallback still exists, and every bug in the guard
is a production incident. There is now one code path.

### Where placeholder content comes from instead

| You want                              | Do this                                                        |
| ------------------------------------- | -------------------------------------------------------------- |
| A populated dev database              | `npm run seed:dev` (see [Dev Data Seeding](#dev-data-seeding)) |
| Content with no API keys / no network | `CONTENT_SOURCE=mock` (defaults to `live`)                     |
| A stand-alone placeholder image file  | `npm run generate-fake-image`                                  |

`CONTENT_SOURCE=mock` runs the **real** write path (jobs → services → SQLite)
with offline, deterministic adapters. Rows it writes are stamped
`contentSource: "mock"` so they can be found again, and the server refuses to
boot with `CONTENT_SOURCE=mock` under `NODE_ENV=production` — as well as
refusing to boot on a production database that still holds `mock` rows.

### Tiled Placeholder Images

The dev seeder and the preview CLI share one tiled-color PNG generator
(`server/src/utils/placeholderImage.ts`, drawn with Jimp). It is configurable:

```env
# Image dimensions (pixels)
FAKE_IMAGE_WIDTH=896       # Default
FAKE_IMAGE_HEIGHT=512      # Default

# Tile grid
FAKE_IMAGE_TILES_X=8       # Tiles horizontally
FAKE_IMAGE_TILES_Y=6       # Tiles vertically

# Color range per RGB channel (each tile picks a random color)
FAKE_IMAGE_COLOR_MIN_R=30
FAKE_IMAGE_COLOR_MAX_R=225
FAKE_IMAGE_COLOR_MIN_G=30
FAKE_IMAGE_COLOR_MAX_G=225
FAKE_IMAGE_COLOR_MIN_B=30
FAKE_IMAGE_COLOR_MAX_B=225
```

### Generate a single placeholder image via CLI

```bash
cd server

# Default image (896x512, 8x6 tiles, random colors)
npm run generate-fake-image

# Custom size with warm tones
npm run generate-fake-image -- --width 1920 --height 1080 --tiles-x 12 --tiles-y 8 \
  --color-min-r 200 --color-max-r 255 --color-min-g 50 --color-max-g 150

# Save to a specific location
npm run generate-fake-image -- --output ~/Desktop/my-image.png

# See all options
npm run generate-fake-image -- --help
```

Images are saved to the server's images directory (same as AI-generated images) and served through `/api/images/:filename`.

### Factory Reset

To wipe the database and images completely:

```bash
docker compose down
# DATABASE_DIR / IMAGES_DIR are required in .env, so read them instead of assuming:
sudo rm -rf "$DATABASE_DIR" "$IMAGES_DIR"
docker compose up --build -d
```

After this the API answers every endpoint with an empty 200 — it does not fill
the gap. Run `npm run seed:dev` (or let the scheduled jobs write rows) if you
want content to look at.

## Troubleshooting

### Services Won't Start

1. Check if ports are already in use (look for stale Vite dev servers from other worktrees):

   ```bash
   sudo ss -tlnp | grep -E '5001|5173|5174'
   # or
   sudo lsof -i :5174
   ```

2. Verify `.env` file exists and has correct values:

   ```bash
   cat .env | grep -E "DATABASE_DIR|IMAGES_DIR|DATABASE_PATH|IMAGES_PATH"
   ```

3. Check Docker logs:
   ```bash
   docker compose logs
   ```

### Client Can't Connect to Server

1. Verify all containers are running:

   ```bash
   docker compose ps
   ```

2. Test server directly:

   ```bash
   curl http://localhost:5001/api/health
   ```

3. Test proxy:

   ```bash
   curl http://localhost:5173/api/health
   ```

4. Rebuild client with correct config:
   ```bash
   docker compose build --no-cache client
   docker compose up -d client
   ```

### Database and image files

- The data directory is whatever `DATABASE_DIR` in the root `.env` points at (there is no
  default) and holds `database.db` + `-wal`/`-shm`; the images directory is whatever
  `IMAGES_DIR` points at and holds the JPEGs
- Both are required — `docker compose up` refuses to start without them, and
  `npm run setup` creates them
- In Docker the app always uses `/data/database.db` and `/images`; the host side is
  `DATABASE_DIR` / `IMAGES_DIR`
- Running the API without Docker? `DATABASE_PATH` and `IMAGES_PATH` in
  `server/.env` are required too — the server exits with
  `MissingPathConfigError` instead of inventing a directory
- Check permissions:
  ```bash
  ls -la /path/to/your/database.db /path/to/your/images
  ```

For more detailed troubleshooting, see:

- `DOCKER_ENV_SETUP.md` - Docker environment setup guide
- `CLIENT_CONNECTION_DEBUG.md` - Client-server connection debugging
- `DATABASE_LOCATION.md` - Database location configuration

# Design

## Front-end

An example website that I use as a model is: https://www.ynet.co.il, https://www.bbc.com/news

The website will have the following elements:

- Logo -> A button to redirect to the home page
- Header -> Contains buttons to the various site sections
- Footer -> Will show information about the website creator and licensing information
- Article -> Will contain a timestamp of creation, an author name, and the content will be shown/saved in a markdown format.
- Home page -> At the top it will present the front-side article, then the other main articles, and then the other lesser sections and articles.

### Possible additions:

- [x] Carousel/News Ticker/Slideshow -> This will show the most recent events/articles in a shortened format and will act as buttons towards the related content.
- [ ] Simple weather description -> This will be a real weather element that will pull from real data sources to show the current weather in various places
- [ ] Local time clock
- [ ] Fake sponsors -> To be added to the footer
- [ ] Comments section in an article -> along with "totally not fake" bot comments
- [ ] Login option through Google or Facebook which allow to leave a comment
- [ ] RSS for articles
- [ ] Search button -> This will allow a user to search through the articles in the website according to key words
- [ ] Automatically generated images in the middle of articles -> and also for banners for the articles
- [ ] A tip jar for the humble creator of said website
- [x] Dark/Light mode button
- [x] Pages for writers for all their articles to be displayed in the page
- [ ] Pagination where needed
- [ ] Games section, **In development** - A tic-tac-toe game and a Trivia game
- [ ] Share buttons on article: https://www.npmjs.com/package/react-share
- [ ] Descriptions for images below them in articles, attribution.

## Back-end

The backend will need to have the following parts for the website to work:

1. A safe and cheap way of connecting to Large Language Models. We will use the OpenAI API in Node and DeepSeek(as it is quite cheap).
2. A complex state machine that takes all existing articles/writers into consideration and chooses the next operation in the website accordingly.
   Writers will interact with other writers, discuss with the editors, and will form simple relationships and life histories of their own that will
   effect their reporting.
3. MongoDB database that will save the articles, the writers and the state as described above. There is also a possibility of saving generated images too.
4. A service that connects to an open News API to take relevant daily information as part of the consideration to write relevant articles.

## Shared Parts:

There are several shared aspects between both the front-end and back-end. The main ones refer to the news categories that we're interested in, and the information in the articles that we want to add to a final JSON representation of these in our article database along with on the front-end website.

# Lessons learned:

- DON'T install npm and node through apt-get, instead, install nvm and use _THAT_ to install those properly: https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/ + https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
- DON'T use "npx create-react-app" because it has constant issues, instead, use Vite: https://vite.dev/guide/ -> For the frontend "client", I used the command: "npm create vite@latest client -- --template react-ts"
- For the Node backend with TypeScript and Express I used the tutorial: https://medium.com/@vihangamallawaarachchi.dev/setting-up-a-node-js-and-express-backend-with-typescript-a-comprehensive-guide-b15fad5c803c
- For the final Node backend typescript config file, I used the tutorial: https://www.totaltypescript.com/tsconfig-cheat-sheet
- To allow for React/Node servers to start up by default on FireFox, you need to install the VSC extension "Debugger for FireFox" and configure the launch.json accordingly. **DOESNT WORK**
- I probably want to pull real news data from the internet to have half-related topics to play with, along with easy input data for the prompts, I suggest two free-enough APIs to think about: https://gnews.io/#pricing , https://newsdata.io/pricing -> I chose the second one
- We are using runware.ai for the image generation
- The Images in the website are(as of 7.5.25) exclusively in a 1.75:1 size.
- For each React component two rules must be kept with in regards to CSS organization:
  1. You must ask yourself whether the component should be an inline or block level element.
  2. An element should not have its own margin or padding unless: it is a basic html tag OR there is no component higher that is responsible for the final look.
