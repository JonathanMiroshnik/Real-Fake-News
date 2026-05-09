# Testing Suite: Vitest + Playwright

> **Status:** Completed
> **Priority:** High (Infrastructure)
> **Branch:** `feature/testing-suite`
> **Ticket Goal:** Add a full testing infrastructure across all three workspaces (server, client, admin) with unit, integration, and end-to-end tests.

---

## Problem

The project had **zero tests**. `npm test` in every workspace just printed `"Error: no test specified"`. This meant:

- No safety net for refactoring — any change risked silent regressions
- No CI feedback loop — no way to catch breaking changes in PRs
- No confidence in deploying — every deploy was a manual "hope it works"
- No documented test patterns — new contributors had no guidance
- No coverage metrics — unknown what percentage of code was exercised
- The database layer (SQLite), service layer (blogService), and API layer (Express routes) were all untested despite being the core of the application

## Goal

1. **Unit tests** for pure utility functions
2. **Integration tests** for database operations (in-memory SQLite)
3. **Integration tests** for API routes (Express + supertest)
4. **Controller tests** with mocked service dependencies (vi.hoisted)
5. **Configuration validation tests** (constants, thresholds)
6. **E2E tests** for homepage and API (Playwright)
7. **Documentation** explaining how to run, write, and maintain tests
8. **Vitest/Vite coupling warning** in every config and the testing guide

---

## Chosen Technologies

### Why Vitest over Jest

| Factor      | Vitest                                                | Jest                                                  |
| ----------- | ----------------------------------------------------- | ----------------------------------------------------- |
| ESM support | Native — works with `"type": "module"` out of the box | Requires `--experimental-vm-modules` and heavy config |
| Speed       | esbuild transform, 10-20x faster                      | Slower, especially with TypeScript                    |
| TypeScript  | Zero config                                           | Needs ts-jest or babel                                |
| Config      | Standalone `vitest.config.ts`                         | Separate `jest.config.ts`                             |
| Coverage    | Built-in v8                                           | Needs additional plugins                              |

### Why Playwright over Cypress

| Factor            | Playwright                  | Cypress       |
| ----------------- | --------------------------- | ------------- |
| Browser support   | Chromium, Firefox, WebKit   | Chromium only |
| Visual regression | Built-in                    | Plugin needed |
| Multi-tab         | Native support              | Not supported |
| Test runner       | Built-in, parallel, sharded | Slower        |

---

## Architecture

### Test File Layout

Tests live **co-located** alongside the code they test:

```
server/src/utils/__tests__/general.test.ts
server/src/utils/__tests__/debugLogger.test.ts
server/src/config/__tests__/constants.test.ts
server/src/lib/database/__tests__/sqliteOperations.test.ts
server/src/routes/__tests__/apiRoutes.test.ts
server/src/controllers/__tests__/blogController.test.ts

client/src/__tests__/App.test.tsx
client/src/__tests__/setup.ts
client/src/services/__tests__/timeService.test.ts

e2e/homepage.spec.ts
e2e/api.spec.ts
```

### Transform Pipeline Isolation

```
Production builds:  Vite/TypeScript compiler → dist/
Tests:              Vitest (uses Vite internally) → runs in Node/jsdom
```

The test pipeline is **completely independent** from the build pipeline. Every `vitest.config.ts` carries a warning banner:

> 🔴 If the project ever switches to a different build tool (Webpack, Turbopack, Rspack, etc.), keep this file as-is. Vitest runs its own Vite transform pipeline separate from any production build tool.

---

## Files Created

### New Files (15)

| File                                                         | Purpose                                     |
| ------------------------------------------------------------ | ------------------------------------------- |
| `server/vitest.config.ts`                                    | Server test config with coverage thresholds |
| `server/src/utils/__tests__/general.test.ts`                 | 9 tests: getUniqueKey, getNRandom           |
| `server/src/utils/__tests__/debugLogger.test.ts`             | 10 tests: conditional logging               |
| `server/src/config/__tests__/constants.test.ts`              | 11 tests: all config values                 |
| `server/src/lib/database/__tests__/sqliteOperations.test.ts` | 10 tests: DB CRUD with :memory:             |
| `server/src/routes/__tests__/apiRoutes.test.ts`              | 8 tests: Express routes via supertest       |
| `server/src/controllers/__tests__/blogController.test.ts`    | 6 tests: vi.hoisted() mocks                 |
| `client/vitest.config.ts`                                    | Client test config (standalone)             |
| `client/src/__tests__/setup.ts`                              | Testing Library matchers                    |
| `client/src/__tests__/App.test.tsx`                          | App module smoke test                       |
| `client/src/services/__tests__/timeService.test.ts`          | 7 tests: getLatestTime boundaries           |
| `playwright.config.ts`                                       | Multi-browser E2E config                    |
| `e2e/homepage.spec.ts`                                       | Homepage navigation & content               |
| `e2e/api.spec.ts`                                            | API health & blog endpoints                 |
| `TESTING.md`                                                 | Full testing guide                          |

### Modified Files (6)

| File                  | Change                                                   |
| --------------------- | -------------------------------------------------------- |
| `server/package.json` | Added `test`, `test:watch`, `test:coverage`              |
| `client/package.json` | Added test scripts + vitest + testing-library deps       |
| `admin/package.json`  | Added placeholder test script                            |
| `package.json` (root) | Added `test`, `test:e2e`, `test:e2e:ui`                  |
| `.gitignore`          | Added `coverage/`, `playwright-report/`, `test-results/` |

---

## Implementation Details

### 1. Database Testing (In-Memory SQLite)

Database tests use `better-sqlite3` with a fresh `:memory:` database per test, avoiding the real DatabaseManager singleton:

```typescript
function createInMemoryDb(): DatabaseType {
  const db = new Database(':memory:');
  db.exec(`CREATE TABLE IF NOT EXISTS blog_posts ( ... )`);
  return db;
}
```

### 2. Controller Mocking

Controllers are tested by mocking imported service modules via `vi.hoisted()`, which survives Vitest's ESM hoisting:

```typescript
const { mockGetRelevantArticles } = vi.hoisted(() => ({
  mockGetRelevantArticles: vi.fn(),
}));

vi.mock('../../services/blogService.js', () => ({
  getRelevantArticles: mockGetRelevantArticles,
}));
```

### 3. API Route Testing

Routes are tested with `supertest` using a minimal Express app:

```typescript
function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', apiRoutes);
  return app;
}
const response = await request(app).get('/api/health');
```

### 4. Client Config (Standalone)

The client `vitest.config.ts` does **not** extend `vite.config.ts` — the build config uses a callback form incompatible with `mergeConfig`. It independently uses the same React plugin:

```typescript
export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', setupFiles: ['./src/__tests__/setup.ts'] },
});
```

### 5. E2E with Playwright

Three browser projects (Chromium, Firefox, WebKit) with dev server auto-start:

```typescript
webServer: [
  { command: 'cd server && npm run dev', url: 'http://localhost:5001/api/health' },
  { command: 'cd client && npm run dev', url: 'http://localhost:5173' },
],
```

---

## Results

```
Server:   6 test files, 55 tests ✅ (1.71s)
Client:   2 test files,  8 tests ✅ (2.02s)
E2E:      2 test files (ready, requires running app)
Total:    8+ test files, 63 tests ✅
```

### Coverage Thresholds (Server)

| Metric     | Minimum |
| ---------- | ------- |
| Statements | 40%     |
| Branches   | 30%     |
| Functions  | 35%     |
| Lines      | 40%     |

---

## How to Run

```bash
cd server && npm test
cd server && npm run test:watch
cd server && npm run test:coverage

cd client && npm test
cd client && npm run test:watch

# All workspaces
npm test

# E2E (requires app running)
npm run test:e2e
npm run test:e2e:ui
```

---

## Edge Cases Covered

| Scenario            | Handling                             |
| ------------------- | ------------------------------------ |
| Empty database      | Controller mocks return empty arrays |
| Service errors      | Controller catch blocks tested       |
| Environment logging | debugLogger: true/false/unset        |
| Date boundaries     | timeService: edge cases at 1h/2h/1d  |
| Missing DB fields   | SQLite tests verify NULL handling    |
| Duplicate keys      | SQLite UNIQUE constraint tested      |
| Path traversal      | API route tests verify sanitization  |

---

## Alternative Approaches Considered

### Jest (Rejected)

ESM support is fragile, requiring `--experimental-vm-modules`. Slower transform. More configuration.

### Mocha + Chai + Sinon (Rejected)

Requires 3+ separate libraries. No built-in TS/coverage/watch. More boilerplate.

### Cypress for E2E (Rejected)

Chromium-only. No multi-tab. Heavy install.

### Bun test runner (Rejected)

Requires Node to Bun switch. Incompatible with native modules (better-sqlite3, sharp).

---

## Future Work

- **Admin workspace tests** — no tests for admin panel yet
- **GitHub Actions CI** — add `.github/workflows/test.yml` for automated runs
- **Component tests** — React Testing Library tests for key components
- **Higher coverage thresholds** — raise minimums as coverage grows
