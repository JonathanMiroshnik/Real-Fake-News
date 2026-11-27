import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchGenerationStatus,
  getVisitorId,
  sendHeartbeat,
} from '../presenceService';

/**
 * The service's contract is mostly about **failure**: every call reports `null`
 * instead of throwing, because these calls run from `setInterval` callbacks where a
 * rejection becomes an unhandled promise rejection and the header keeps showing a
 * stale light.
 *
 * The visitor id is the other half: it must be stable per browser, so a second tab
 * is not counted as a second reader, and it must still be produced when
 * `localStorage` is unavailable.
 *
 * Storage is installed per test rather than taken from the environment: `jsdom` does
 * not expose `localStorage` here (Node's own experimental global shadows it), which
 * is also why the service touches `window.localStorage` and not a bare global.
 */
const VISITOR_ID_STORAGE_KEY = 'presenceVisitorId';

/** A minimal in-memory `Storage`, installed as `window.localStorage`. */
function installMemoryStorage(): Storage {
  let entries = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return entries.size;
    },
    clear: () => {
      entries = new Map();
    },
    getItem: (key: string) => entries.get(key) ?? null,
    key: (index: number) => Array.from(entries.keys())[index] ?? null,
    removeItem: (key: string) => {
      entries.delete(key);
    },
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    },
  };

  Object.defineProperty(window, 'localStorage', { value: storage, configurable: true });
  return storage;
}

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => body,
  } as Response;
}

/** The v4 shape the service promises. */
const V4_UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('presenceService', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let storage: Storage;

  beforeEach(() => {
    storage = installMemoryStorage();
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('getVisitorId', () => {
    it('mints an id once and reuses it, so two tabs count as one reader', () => {
      const firstId = getVisitorId();
      const secondId = getVisitorId();

      expect(firstId).toBe(secondId);
      expect(storage.getItem(VISITOR_ID_STORAGE_KEY)).toBe(firstId);
    });

    it('produces a v4 UUID shape', () => {
      expect(getVisitorId()).toMatch(V4_UUID_PATTERN);
    });

    it('still returns an id when storage rejects reads and writes', () => {
      vi.spyOn(storage, 'getItem').mockImplementation(() => {
        throw new Error('storage disabled');
      });

      expect(getVisitorId()).toMatch(V4_UUID_PATTERN);
    });

    it('falls back to getRandomValues when randomUUID is missing (plain HTTP origin)', () => {
      vi.stubGlobal('crypto', {
        getRandomValues: (bytes: Uint8Array) => {
          bytes.fill(7);
          return bytes;
        },
      });

      expect(getVisitorId()).toMatch(V4_UUID_PATTERN);
    });
  });

  describe('sendHeartbeat', () => {
    it('posts the visitor id and path, and returns the snapshot', async () => {
      const snapshot = { count: 4, ttlMilliseconds: 45_000, heartbeatIntervalMilliseconds: 15_000 };
      mockFetch.mockResolvedValue(jsonResponse(snapshot));

      const result = await sendHeartbeat('/category/food');

      expect(result).toEqual(snapshot);
      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/presence/heartbeat');
      expect(init.method).toBe('POST');
      expect(JSON.parse(init.body as string)).toEqual({
        visitorId: getVisitorId(),
        path: '/category/food',
      });
    });

    it('reports null on a non-2xx answer instead of throwing', async () => {
      mockFetch.mockResolvedValue(jsonResponse({ error: 'nope' }, 400));

      await expect(sendHeartbeat('/')).resolves.toBeNull();
    });

    it('reports null when the network fails', async () => {
      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(sendHeartbeat('/')).resolves.toBeNull();
    });
  });

  describe('fetchGenerationStatus', () => {
    it('returns the status payload', async () => {
      const status = {
        lastGeneratedAt: '2026-11-17T11:00:00.000Z',
        isGenerating: true,
      };
      mockFetch.mockResolvedValue(jsonResponse(status));

      await expect(fetchGenerationStatus()).resolves.toEqual(status);
      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/generation/status');
      expect(init.method ?? 'GET').toBe('GET');
    });

    it('reports null when the API is unreachable', async () => {
      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

      // `null` is what turns the indicator grey: "I cannot tell", never "all fine".
      await expect(fetchGenerationStatus()).resolves.toBeNull();
    });
  });
});
