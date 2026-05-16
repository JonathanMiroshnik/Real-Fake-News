**REAL FAKE NEWS**

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

### Key Changes from Previous Version

| Change              | Before                                                                   | After                                                                             |
| ------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Container names     | `real-fake-news-client`, `real-fake-news-server`, `real-fake-news-admin` | `client`, `server`, `admin`                                                       |
| Port exposure       | Each service exposed host ports                                          | **No ports exposed** — all communication over `devops_shared` Docker network      |
| Docker network      | Internal `app-network` (bridge)                                          | External `devops_shared` (shared VPS network)                                     |
| Health checks       | Present in all Dockerfiles                                               | Removed — shared nginx handles failures gracefully                                |
| Server debug blocks | Present in Dockerfile                                                    | Removed — production image is leaner                                              |
| Admin serving       | Proxied through client nginx at `/admin/*`                               | Served on its own subdomain via shared nginx (e.g. `admin.real.sensorcensor.xyz`) |

# Environment Configuration

All environment variables, config files, and constants used across the project are documented in **`ENV_CONFIG.example`** in the root directory.

This comprehensive file includes:

- **Environment Variables**: All `.env` variables for Server, Client, and Admin
- **Config Files**: Documentation of all configuration files and their purposes
- **Constants**: All hardcoded constants and where they're used

The file is organized by:

- **Server** (Node.js/Express backend) - `server/.env`
- **Client** (React frontend) - `client/.env`
- **Admin** (React admin panel) - `admin/.env`

To set up the project:

1. Copy `ENV_CONFIG.example` and extract the relevant sections to create `.env` files in each subdirectory
2. Fill in your API keys (DeepSeek, NewsData.io, Runware)
3. Configure Gmail credentials if using email service
4. Set a secure `ADMIN_PASSWORD` (change from default!)

See `ENV_CONFIG.example` for complete documentation of all environment variables, config files, and constants.

# Running the Application

## Prerequisites

1. **Docker and Docker Compose** installed on your system
2. **Root `.env` file** created:
   ```bash
   # Copy from example (create one from ENV_CONFIG.example if missing)
   # Edit .env and fill in your API keys and paths
   ```
3. **Docker network** (for local testing):
   ```bash
   docker network create devops_shared
   ```

## Local Development

**Use the override file for testing on your dev machine.** The override adds port mappings so you can access services from your browser.

```bash
# Build and start all services with port mappings
docker compose up --build -d

# Access:
#   Client SPA:    http://localhost:5173
#   Admin panel:   http://localhost:5174
#   API directly:  http://localhost:5001/api/health

# View logs
docker compose logs -f

# Stop services
docker compose down
```

The `docker-compose.override.yml` file is auto-merged by Docker Compose — no `-f` flag needed. On the VPS, this file is absent so only the production config applies (no port exposure).

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
docker compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache client
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d client
```

**Production:**

```bash
docker compose build --no-cache client
docker compose up -d client
```

### View Service Logs

**Development:**

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f server
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f client
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
docker compose -f docker-compose.yml -f docker-compose.dev.yml ps
```

### Stop All Services

**Development:**

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

**Production:**

```bash
docker compose down
```

### Generate Mock Data

To populate the database with sample data for testing and development:

**Using Docker Compose:**

```bash
docker compose exec server npm run generate-mock-data
```

**Or with custom options:**

```bash
docker compose exec server npm run generate-mock-data --writers 3 --articles 10 --recipes 5 --no-foods
```

**Available options:**

- `--writers <number>`: Number of writers to generate (default: 5)
- `--articles <number>`: Number of articles to generate (default: 20)
- `--news-items <number>`: Number of news items to generate (default: 15)
- `--featured <number>`: Number of featured articles to generate (default: 5)
- `--recipes <number>`: Number of recipes to generate (default: 10)
- `--horoscopes <number>`: Number of horoscopes to generate (default: 24)
- `--no-foods`: Skip inserting food names (default: insert foods)
- `--help, -h`: Show help message

**Examples:**

```bash
# Generate default amount of data
docker compose exec server npm run generate-mock-data

# Generate minimal data
docker compose exec server npm run generate-mock-data --writers 2 --articles 5

# Generate data without food entries
docker compose exec server npm run generate-mock-data --no-foods

# Show help
docker compose exec server npm run generate-mock-data --help
```

The mock data generator creates realistic sample data including:

- Writers with profiles and system prompts
- Articles with different categories (Technology, Travel, Food, Science, etc.)
- News items with breaking news
- Featured articles with multiple authors and sub-articles
- Recipes with ingredients and instructions
- Horoscopes with astrological data
- Basic food names for recipe generation

All data is inserted into the SQLite database and includes realistic Lorem Ipsum content, dates within the past year, and proper relationships between entities.

## Fake Data Fallback

When the database is empty (fresh deployment, demo, or during development), the API can automatically generate placeholder content so the frontend always has something to display. This is controlled by the `ENABLE_FAKE_DATA` environment variable.

### How it works

1. Frontend requests articles/recipes/horoscopes from the API
2. Service queries the database — returns empty
3. Controller checks `isFakeDataEnabled()` → `ENABLE_FAKE_DATA=true` in `.env`
4. `fakeDataService.ts` generates in-memory content with satirical headlines, fake writer profiles, and tiled-color placeholder images
5. Response returned in the exact same JSON format as real data — frontend renders normally

### What gets generated

| Content Type         | Trigger                                     | Fallback                                                   |
| -------------------- | ------------------------------------------- | ---------------------------------------------------------- |
| **Blog articles**    | All `/api/blogs/*` endpoints return empty   | 8 articles with unique fake headlines, writers, and images |
| **Featured article** | No featured article for the requested date  | 1 featured article with a special report headline          |
| **Recipes**          | All `/api/recipes/*` endpoints return empty | 4 humorous recipes with fake instructions                  |
| **Horoscopes**       | Requested zodiac sign not found             | All 12 signs with playful, generic horoscopes              |

### Configuration

Set in `server/.env`:

```env
# Enable/disable fake data fallback
ENABLE_FAKE_DATA=true
```

### Tiled Placeholder Images

Fake articles include auto-generated placeholder images — tiled color PNGs created with Jimp:

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

### Marking Fallback Content

All fake items have `writerType: "Synthesis"` so frontends can optionally detect and label them (e.g., display an "Auto-generated" badge).

### Factory Reset

To wipe the database and images completely (useful for testing the fallback):

```bash
docker compose down
sudo rm -rf ./database/
docker compose up --build -d
```

After this, the API will return fake content whenever endpoints are hit.

## Troubleshooting

### Services Won't Start

1. Check if ports are already in use:

   ```bash
   netstat -tulpn | grep -E "5001|5173|5174"
   ```

2. Verify `.env` file exists and has correct values:

   ```bash
   cat .env | grep -E "DATABASE_PATH"
   ```

3. Check Docker logs:
   ```bash
   docker compose logs
   ```

### Docker Containers Won't Stop / Kill

Sometimes `docker compose down` doesn't fully kill containers — especially when:
- Containers were started from different compose files or outside compose entirely
- Orphaned containers exist from a previous project state
- The compose project name doesn't match (e.g., started with `-f` flag but stopped without it)

**The kill chain (escalating force):**

```bash
# 1. Check what's running
docker ps -a

# 2. Stop all running containers gracefully
docker compose -f docker-compose.yml down

# 3. If using the dev override, stop via both files
docker compose -f docker-compose.yml -f docker-compose.dev.yml down

# 4. Check for any compose projects still active
docker compose ls

# 5. NUCLEAR — stop & remove ALL containers (not just this project)
docker stop $(docker ps -q) 2>/dev/null
docker rm $(docker ps -aq) 2>/dev/null

# 6. SUPERNOVA — remove all unused Docker resources (containers, networks, images)
docker system prune -a --volumes -f
```

`docker system prune -a --volumes -f` is the absolute last resort — it deletes **all** containers, images, volumes and networks not currently in use by a running container. This will wipe cached image layers and require a full rebuild on next startup.

### Why `docker compose down` Sometimes Fails

The most common causes:

| Cause | Symptom | Fix |
|-------|---------|-----|
| **Wrong compose file** | `docker compose down` says "no such service" | Use the correct `-f` flag: `docker compose -f docker-compose.dev.yml down` |
| **Container started manually** | Container exists but compose doesn't know about it | Kill by name: `docker rm -f client server admin` |
| **Container is stuck** | `docker stop` hangs indefinitely | Force kill: `docker kill <container-id>` then `docker rm <container-id>` |
| **Dev override auto-merge** | Ports 5173/5174 still bound after down | The override file auto-merges as `docker-compose.override.yml` — check if it exists in the root |

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
   docker compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache client
   docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d client
   ```

### Database Issues

- Ensure the database directory (default: `./database/`) exists and is writable
- The `DATABASE_PATH` env var overrides the default database location
- Check database file permissions:
  ```bash
  ls -la /path/to/your/database.db
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
