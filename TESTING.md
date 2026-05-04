# Testing Guide — Real Fake News

## Overview

This project uses **Vitest** for unit/integration tests and **Playwright** for end-to-end (E2E) tests.

| Layer | Tool | Location |
|---|---|---|
| Server unit/integration | Vitest + Supertest | `server/` |
| Client unit/component | Vitest + Testing Library | `client/` |
| Admin unit/component | Vitest + Testing Library | `admin/` |
| E2E | Playwright | `e2e/` |

---

## 🔴 Important: Vitest & Vite Relationship

**Vitest uses Vite as its transform engine.** When you install Vitest, Vite is installed as a hard dependency. This means:

- Vitest runs its **own isolated Vite pipeline** at test-time
- This pipeline is **completely separate** from any build tool used for production

### Can I switch build tools (e.g., from Vite to Webpack)?

**Yes — Vitest can stay.** Even if you switch the production build tool to Webpack, Turbopack, Rspack, etc.:

```
Production:  Webpack/Turbopack  →  bundle for browser
Tests:       Vite (inside Vitest)  →  transform for test runner
```

The two pipelines are independent. This is standard practice — Jest users with Webpack also maintain two separate transform pipelines.

### What to do if migrating away from Vite

1. **Keep the `vitest.config.ts` files** in each workspace — they are standalone configs
2. **Do NOT merge them** with whatever new build tool config you adopt
3. **Exclude them** from any build-tool migration scripts
4. The only consequence is that Vite remains in `node_modules` as a Vitest dependency (~30MB)

### Naming convention for clarity

| File | Purpose | Should be touched by build migration? |
|---|---|---|
| `server/vitest.config.ts` | Test config only | ❌ No — keep as-is |
| `client/vitest.config.ts` | Test config only | ❌ No — keep as-is |
| `admin/vitest.config.ts` | Test config only | ❌ No — keep as-is |
| `client/vite.config.ts` | Build config | ✅ Yes — can be replaced |

---

## Running Tests

### Server

```bash
# All tests (single run)
cd server && npm test

# Watch mode (re-run on changes)
cd server && npm run test:watch

# With coverage
cd server && npm run test:coverage
```

### Client

```bash
cd client && npm test
cd client && npm run test:watch
cd client && npm run test:coverage
```

### Admin

```bash
cd admin && npm test
cd admin && npm run test:watch
cd admin && npm run test:coverage
```

### E2E (Playwright)

```bash
# Install browsers (first time)
npx playwright install

# Run all E2E tests
npx playwright test

# Run with UI mode
npx playwright test --ui

# Run a specific test file
npx playwright test homepage
```

### All workspaces

```bash
npm run test --workspaces --if-present
```

---

## Test File Conventions

| Pattern | Location |
|---|---|
| `*.test.ts` | Any `__tests__/` directory |
| `*.spec.ts` | Any `__tests__/` directory |
| `*.e2e.ts` | `e2e/` directory |

Tests live **alongside the code they test** in co-located `__tests__/` directories:

```
server/
  src/
    utils/
      __tests__/
        general.test.ts
        debugLogger.test.ts
    controllers/
      __tests__/
        blogController.test.ts
    lib/database/
      __tests__/
        sqliteOperations.test.ts
```

---

## Coverage Thresholds (Server)

Current minimums (configurable in `vitest.config.ts`):

| Metric | Minimum |
|---|---|
| Statements | 40% |
| Branches | 30% |
| Functions | 35% |
| Lines | 40% |

---

## Mocking Strategy

| Scenario | Approach |
|---|---|
| Database (SQLite) | In-memory `:memory:` database per test |
| External APIs (NewsData, DeepSeek) | `vi.mock()` module-level mocks |
| Express controllers | `vi.hoisted()` + `vi.mock()` for service modules |
| HTTP requests in integration tests | `supertest` with lightweight Express app |

### Database testing

Use an in-memory SQLite database for all DB-related tests:

```typescript
import Database from 'better-sqlite3';

function createInMemoryDb() {
  const db = new Database(':memory:');
  db.exec(`CREATE TABLE IF NOT EXISTS ...`);
  return db;
}
```

### Controller testing

Use `vi.hoisted()` to create mock references that survive Vitest's hoisting:

```typescript
const { mockMyService } = vi.hoisted(() => ({
  mockMyService: vi.fn(),
}));

vi.mock('../../services/myService.js', () => ({
  myFunction: mockMyService,
}));
```

---

## Adding New Tests

1. Create a `__tests__/` directory next to the file being tested
2. Name the test file `<filename>.test.ts`
3. Import only what you need
4. For database tests — use `:memory:` SQLite
5. For controller tests — use `vi.hoisted()` mocks
6. For API integration tests — use `supertest` with a minimal Express app
7. Run `npm test` to validate
