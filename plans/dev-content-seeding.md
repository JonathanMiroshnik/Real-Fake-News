# Dev Content: Deterministic Seeder + Content-Source Adapters

> **Status:** Planned · **Priority:** High · **Related:** `plans/horoscope-cron-wiring.md` · **Order:** commits 5–7 and 9 of the 2026-11-07 session (`plans/README.md`)

## Problem

Three separate reasons a dev stack renders an empty site.

1. **Dev runs no writers.** There are exactly three write paths — cron jobs
   (`server/src/jobs/scheduler.ts`), the admin panel (`adminController.ts`, 13 endpoints
   including image upload), and CLI scripts. Nothing public writes. `docker-compose.dev.yml`
   pins `ENABLE_SCHEDULED_JOBS: 'false'`, and the dev overlay has no seeding step, so a fresh
   dev database stays empty forever.
2. **`ENABLE_FAKE_DATA` is the wrong layer.** It is a _read-time_ fallback inside
   `blogController`, `recipeController` and `horoscopeController`: content is generated per
   request, never persisted, gets a new UUID and a new image every time (so client caching and
   ETags never hit), writes 8 orphan PNGs per request through a Jimp tile loop, and never
   touches the insert path production uses. It is also `true` by default in
   `docker-compose.yml`, i.e. production can silently serve invented articles when the DB is
   empty.
3. **Root cause — the pipeline has no seam.** Jobs call `newsService` → newsdata.io,
   `llmService` → DeepSeek and `imageService` → Runware _directly_. The only way to run the
   pipeline without keys or cost is to switch it off, which is the coupling: **no keys ⇒ no
   jobs ⇒ no data ⇒ the write path is never exercised in dev.** Fixing that (Phase 3) also
   makes Phases 1–2 mostly unnecessary ceremony: with **mock** adapters the _real_ pipeline
   produces dev data, deterministically and free.

## Where the mock begins — the seam, precisely

"What gets mocked" is decided by _where_ the seam sits. Three candidate levels, and the
reason only the third one is right:

| Level             | Seam                                                                                         | What still runs for real                                                                           | Why not                                                                                                                                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Network           | `nock`/`msw` intercepting axios and the `openai` HTTP client                                 | everything, including the provider client and its parsers                                          | must fake each provider's payload shape (breaks on every API version bump), **cannot** intercept the Runware **WebSocket** SDK, and needs interception inside every runtime (container, cron, `tsx` script, vitest) |
| SDK               | inject a fake `OpenAI`/`Runware`/axios instance                                              | our prompt building + response parsing                                                             | same payload-shape maintenance, and the fake must satisfy third-party types                                                                                                                                         |
| **Port** (chosen) | the function the job calls: `NewsSource`, `TextGenerator`, `ImageGenerator`, `TransitSource` | everything above the port — prompts, dedupe, scoring, DB inserts, image compression, row lifecycle | —                                                                                                                                                                                                                   |

Concretely, one row per external dependency. The mock **replaces the function that talks to
the provider, not the HTTP response** — so no `fetch`/`axios`/SDK call ever happens in mock
mode, and nothing below the port executes:

| Port                                   | Live call chain today                                                                                                                                                                                                                     | What the mock replaces                     | What the mock returns                                                                                                                                        |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NewsSource.fetchLatest(count)`        | `jobs/newsFetching.addNewsToTotal()` → `newsService.fetchNews()` → `axios.get(NEWS_API_BASE_URL, { apikey })` (newsdata.io)                                                                                                               | `newsService.fetchNews()`                  | canned `NewsItem[]` — fixed `article_id`s, dates spread over the last week                                                                                   |
| `TextGenerator.generate(prompt, type)` | `jobs/blogWriting` / `recipeGeneration` / `horoscopeGeneration` → `blogService.writeBlogPost()` and friends → `llmService.generateTextFromString()` → `new OpenAI({ baseURL: 'https://api.deepseek.com' })` → `chat.completions.create()` | `llmService.generateContent()`             | text / `json_object` shaped like the real response, derived from a hash of the prompt (different prompt ⇒ different text, same prompt ⇒ byte-identical text) |
| `ImageGenerator.generate(prompt)`      | `blogService.writeBlogPost()` → `imageService.generateImage()` → `runware.requestImages()` (WebSocket) → data URI → `saveDataUriAsWebp()`                                                                                                 | `imageService.generateImage()` **only**    | a real local JPEG from `generatePlaceholderImage()`, saved through the normal `saveDataUri*` path                                                            |
| `TransitSource.fetchForDate(date)`     | `jobs/horoscopeGeneration` → `horoscopeService.generateHoroscopesForDate()` → `astrologyService.fetchAstrologicalData()` → `axios.get('https://api.freeastroapi.com/planets')`                                                            | `astrologyService.fetchAstrologicalData()` | seeded planetary longitudes + retrogrades for that date                                                                                                      |

Two consequences worth stating, because they are the point of the exercise:

- The **text** mock is pure memory — the article row it produces is written by the same
  `createPost()` that production uses, so the insert path is covered.
- The **image** mock writes a _real file_ through the real compression path, because the
  file/DB lifecycle is exactly the part that keeps leaking (8 orphan PNGs per fake request).
  Mocking that away would hide the bug class.

## Where the mock content lives

Mock content is **code, not a committed database**:
`server/src/services/contentSources/mocks/mockContent.ts` (typed arrays + one
`mulberry32(FIXED_SEED)`), because a seeded generator keeps the file small and the diff
readable, while a giant JSON forces review of every content tweak and gives no type safety
(a new schema column would not even be a compile error). Images come from the existing
`generatePlaceholderImage()` into `IMAGES_PATH`, so the set needs no binary assets. The seed
script stays boring on purpose:

```
read mock content → for each entity: createPost(row, dbConfig) → generate head image → done
```

Rules that keep it simple:

- **Deterministic:** one `mulberry32(FIXED_SEED)` PRNG, timestamps derived from "now minus
  N hours" so the feed always looks recent.
- **Idempotent:** if `blog_posts` is non-empty, exit 0 with "already seeded"; `--reset`
  deletes the four content tables (and their images) first.
- **Safe:** refuses to run with `NODE_ENV=production` unless `--force`.
- **Writes through `sqliteOperations`**, so `config/paths.ts` decides the location (same code
  path as the jobs) instead of duplicating path logic.

## Phase 0 — prerequisite bugfix (blocks everything else in dev)

- [ ] `client/nginx.conf:38` — `proxy_pass $backend_server/api;` → `proxy_pass $backend_server$request_uri;`
- [ ] `admin/nginx.conf:38` — same fix
- [ ] Why: with a variable in `proxy_pass`, nginx does **not** append the request URI, so every
      `/api/*` call reached Express as `GET /api` and hit the catch-all 404 (`path: "/"`).
      Regression from `e10f5e6e`, newly visible because the dev overlay now sets
      `VITE_USE_RELATIVE_API=true`
- [ ] Verify: `curl -s localhost:5173/api/blogs | head`, and an image URL returns `200`

## Phase 1 — deterministic seeder

- [ ] Add `server/src/services/contentSources/mocks/mockContent.ts`: 5 writers, ~20 articles over the
      last week, 15 news items, 10 recipes, 12 horoscopes (today), 5 foods
- [ ] Rewrite `generateMockData.ts` → `server/src/scripts/seedDevData.ts`
      (write via `sqliteOperations`, images via `generatePlaceholderImage()`, no
      `https://example.com/images/...` URLs)
- [ ] Flags: `--reset`, `--force`, `--seed <n>`; `NODE_ENV=production` guard
- [ ] `server/package.json`: add `seed:dev` / `seed:reset`; delete `generate-mock-data`
- [ ] `docker-compose.dev.yml`: one-shot `seed` service
      (`command: ["node","--no-warnings","dist/scripts/seedDevData.js"]`, same `env_file`,
      same `/data` + `/images` volumes, `restart: "no"`), so `npm run docker:dev` yields a
      populated site
- [ ] Stop `docker-compose.yml` from defaulting `ENABLE_FAKE_DATA: true` (production must not
      invent content); keep `false` until Phase 2 removes the flag
- [ ] Docs: replace the "`npm run seed` is stale" gotcha in `docs/configuration.md`, update
      `server/src/scripts/README.md`

## Phase 2 — drop the read-time fake fallback

- [ ] Remove the `isFakeDataEnabled()` guards from `blogController` (5 sites),
      `recipeController` (3 sites), `horoscopeController` (1 site)
- [ ] Delete the fake generators in `server/src/services/fakeDataService.ts`
      (`generateFakeArticle(s)`, `getFakeBlogResponse`, `generateFakeRecipe(s)`,
      `generateFakeHoroscopes`, `generateFakeFeaturedArticle`); **keep**
      `generatePlaceholderImage()` — the seeder depends on it
- [ ] Remove `ENABLE_FAKE_DATA` from `docker-compose.yml`, `.env.example`, `README.md`,
      `server/README.md`, `docs/configuration.md`
- [ ] Regression: empty database now answers `200 { posts: [], ... }` consistently instead of
      random content, and an image request for a missing file is a clean `404`

## Phase 3 — content-source adapters (the structural fix)

The point of this phase: dev should run the **production write path** (jobs → services →
SQLite) against free, deterministic content instead of replacing that path at read time.

- [ ] Introduce `server/src/services/contentSources/` with one port per external dependency,
      exactly at the seams listed in "Where the mock begins": `NewsSource` (`fetchLatest(count)`),
      `TextGenerator` (`generate(prompt, type)`), `ImageGenerator` (`generate(prompt)`),
      `TransitSource` (`fetchForDate(date)`)
- [ ] `live` implementations wrap the existing `newsService.fetchNews()` /
      `llmService.generateContent()` / `imageService.generateImage()` /
      `astrologyService.fetchAstrologicalData()` calls unchanged — the ports are a rename of the
      seam, not a rewrite of the providers
- [ ] `mock` implementations (`contentSources/mocks/`): seeded PRNG, prompt-hash → canned text,
      local placeholder images, frozen transit table — zero network, zero keys, zero cost
- [ ] Select the implementation once at startup from an explicit `CONTENT_SOURCE=live|mock` env
      var (default `live`; the dev overlay sets `mock`). Jobs take the port as a parameter — no
      module-level singletons. **This one variable is what `ENABLE_FAKE_DATA` becomes**, at the
      correct layer: it switches the _writer_ to fake input instead of the _reader_ to fake output
- [ ] Add a clock/interval scale factor (`JOBS_TIME_SCALE=60`) so a week of schedule runs in
      minutes; `Math.random()` jitter goes through the injected PRNG
- [ ] Keep the seeder anyway (it is the "known state" reset), but it reads the same
      `mockContent.ts` the mock adapters use, so there is exactly one source of fake content
- [ ] Tests: one integration test per job run against `CONTENT_SOURCE=mock` asserting rows land in
      SQLite — this is the write path coverage the project currently lacks

## Phase 4 — image lifecycle

- [ ] Give image files an owner: store `headImage` as a filename (already the case) and have
      `deletePost` remove the original + compressed copy
- [ ] `npm run images:gc` — delete files in `IMAGES_PATH` that no row references
      (this would have caught the 8-orphans-per-request leak from the fake fallback)
- [ ] Document the rule in `docs/configuration.md`: images are owned by rows, not by requests

## DevOps Impact

- No new required variables. New optional ones: `CONTENT_SOURCE`, `JOBS_TIME_SCALE`.
- Dev stack gains one short-lived container (`seed`); `docker compose up` still returns once
  the API is healthy.
- Nothing here changes production behaviour as long as `ENABLE_FAKE_DATA` stops defaulting to
  `true`.

## Testing

- `seedDevData.ts`: run twice → second run is a no-op; `--reset` → row counts identical to a
  fresh run (deterministic); image files created in `IMAGES_PATH` match the row count ×2
  (original + compressed).
- `CONTENT_SOURCE=mock` job run: 20 articles after one pass, no outbound network
  (`vi.mock` on `axios`/`openai`/`@runware/sdk-js` to prove the ports never reached them).
- Manual dev smoke: `npm run docker:dev`, then `localhost:5173` shows articles, thumbnails load,
  and `/api/blogs?limit=20` returns the same ETag across two calls.

## Edge Cases

- **Existing developers' databases** already contain fake-fallback garbage? No — that data was
  never persisted; `--reset` is only needed after schema or mock-content changes.
- **Seeding while the API is up:** SQLite WAL handles concurrent writers, but the seeder runs
  as a separate one-shot container before the API is useful — run it on `depends_on:
server: { condition: service_started }` or document `npm run seed:dev` for host runs.
- **Root-owned files:** the server container runs as root, so seeded images land root-owned;
  `--reset` must therefore run inside a container too, not on the host.
- **Mock drift:** if a schema column is added, the mock content file is a compile error (typed),
  which is the point of keeping it as TypeScript.

## Alternatives Considered

- **Commit a prebuilt `database.db`:** binary blob in git, drifts with every schema change,
  cannot be reset or reviewed; rejected.
- **`seed.sql` dump + `sqlite3 < seed.sql`:** cheap and language-agnostic, but still needs
  images generated and gives no type checking; keep as a fallback if mock-content-as-code grows.
- **Keep `ENABLE_FAKE_DATA` and make it persist:** turns a read path into a hidden write path
  per request — worse than either extreme.
- **Point dev at a copy of production data:** incompatible with privacy expectations and with
  running the pipeline at all.
- **Mock at the network layer (`nock`/`msw`):** keeps the provider client and its parsers in
  play, which sounds attractive, but it cannot intercept the Runware WebSocket SDK and forces
  us to keep every provider's payload shape in sync by hand. Reconsider only if we need to test
  a _provider client_ itself.
