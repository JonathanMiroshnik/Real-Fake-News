/**
 * Presence and generation-status calls for the header indicator.
 *
 * Two independent questions, deliberately kept independent:
 * - "How many people are here?" — `sendHeartbeat()`, one small POST per beat.
 * - "Is anything being generated right now?" — `fetchGenerationStatus()`, read-only.
 *
 * Neither function throws on a failed request: they return `null`, and the caller
 * decides what "I don't know" should look like. A thrown error here would become an
 * unhandled rejection from a `setInterval` callback, and the header would keep
 * showing a stale green light.
 */
import { getApiBaseUrlWithPrefix } from '../config/apiConfig';
import { debugLog, debugError } from '../utils/debugLogger';

/** The visitor's own identity, stable across tabs and reloads. */
const VISITOR_ID_STORAGE_KEY = 'presenceVisitorId';

/** What the server answers to a heartbeat, and to `GET /api/presence`. */
export interface PresenceSnapshot {
  count: number;
  ttlMilliseconds: number;
  heartbeatIntervalMilliseconds: number;
}

/** What `GET /api/generation/status` answers. */
export interface GenerationStatus {
  lastGeneratedAt: string | null;
  isGenerating: boolean;
}

/**
 * A random RFC 4122 v4 id.
 *
 * `crypto.randomUUID` is only exposed on secure origins, and this site is also run
 * over plain HTTP locally, so the fallback matters rather than being decorative.
 * The id is a presence handle, not a secret: it is never used for authorisation.
 */
function createVisitorId(): string {
  const cryptoApi = globalThis.crypto;
  const canUseRandomUuid = typeof cryptoApi?.randomUUID === 'function';
  if (canUseRandomUuid) return cryptoApi.randomUUID();

  const randomBytes = new Uint8Array(16);
  if (typeof cryptoApi?.getRandomValues === 'function') {
    cryptoApi.getRandomValues(randomBytes);
  } else {
    // Last resort for non-secure contexts with no Web Crypto at all. Collisions
    // only merge two readers into one presence entry, so weak randomness is
    // tolerable here and nowhere near a security boundary.
    for (let index = 0; index < randomBytes.length; index += 1) {
      randomBytes[index] = Math.floor(Math.random() * 256);
    }
  }

  randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40; // version 4
  randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80; // variant 10
  const hex = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * The visitor id for this browser, created on first use.
 *
 * `localStorage` rather than `sessionStorage`: presence is counted per person, so a
 * second tab must not look like a second visitor. Storage can be unavailable
 * (private mode, disabled cookies, a page served in a sandbox); the id then lives
 * for the page's lifetime only, which still produces a correct count — it just
 * changes on reload.
 *
 * Read through `window` on purpose: a bare `localStorage` global is not the same
 * object once a bundler or a test runner injects its own, and the API is reachable
 * that way regardless.
 */
export function getVisitorId(): string {
  try {
    const storedId = window.localStorage.getItem(VISITOR_ID_STORAGE_KEY);
    if (storedId) return storedId;

    const newId = createVisitorId();
    window.localStorage.setItem(VISITOR_ID_STORAGE_KEY, newId);
    return newId;
  } catch {
    return createVisitorId();
  }
}

/** URL-safe encoding for the visitor id / path inside a debug message. */
function describeRequestFailure(outcome: 'network' | 'status', detail: string): string {
  return outcome === 'network' ? `network error (${detail})` : detail;
}

/** Shared `fetch` + JSON handling: any failure is logged and reported as `null`. */
async function requestJson<T>(url: string, init: RequestInit): Promise<T | null> {
  const method = init.method ?? 'GET';

  try {
    const response = await fetch(url, init);

    if (!response.ok) {
      const reason = describeRequestFailure('status', `${response.status} ${response.statusText}`);
      debugError(`❌ [presence] ${method} ${url} failed: ${reason}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    debugError(`❌ [presence] ${method} ${url} failed: ${describeRequestFailure('network', message)}`);
    return null;
  }
}

/**
 * Tells the server this visitor is still here, and returns the current count.
 *
 * @param path the client route being read, for a future "reading X" admin view.
 * @returns the snapshot, or `null` when the request failed.
 */
export async function sendHeartbeat(
  path: string = window.location.pathname,
): Promise<PresenceSnapshot | null> {
  const url = `${getApiBaseUrlWithPrefix()}/presence/heartbeat`;
  const snapshot = await requestJson<PresenceSnapshot>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitorId: getVisitorId(), path }),
  });

  debugLog('💓 [presence] heartbeat:', snapshot?.count ?? 'failed');
  return snapshot;
}

/** Asks whether a producer committed anything recently. */
export async function fetchGenerationStatus(): Promise<GenerationStatus | null> {
  const url = `${getApiBaseUrlWithPrefix()}/generation/status`;
  return requestJson<GenerationStatus>(url, { method: 'GET' });
}
