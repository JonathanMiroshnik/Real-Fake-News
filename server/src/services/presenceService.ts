/**
 * Live presence: who is on the site right now.
 *
 * The registry is an in-process `Map`, which is the right shape for one Node
 * process (`contracts/architecture.md`: the apps are self-contained, and there is no
 * shared cache in the stack). A second instance would need a shared store; that is
 * a deployment change, not something this service can hide.
 *
 * Presence is counted **per visitor**, not per tab: the client sends a
 * `localStorage` UUID, so two tabs count once and `<StrictMode>`'s double mount in
 * dev does not inflate the number. Entries expire `PRESENCE_TTL_MILLISECS` after
 * their last beat, so a closed tab disappears on its own within that window.
 *
 * State lives in this module rather than on the request, and `recordHeartbeat()`
 * prunes on write, so the map cannot accumulate one entry per visitor ever seen.
 */
import {
  PRESENCE_HEARTBEAT_INTERVAL_MILLISECS,
  PRESENCE_TTL_MILLISECS,
} from '../config/constants.js';
import { debugLog } from '../utils/debugLogger.js';

/** One visitor's last beat. `path` is kept for a future "reading X" admin view. */
interface PresenceEntry {
  lastSeenAt: number;
  path: string;
}

/** What the route returns. `ttlMilliseconds` lets the client pick its own interval. */
export interface PresenceSnapshot {
  count: number;
  ttlMilliseconds: number;
  heartbeatIntervalMilliseconds: number;
}

/**
 * Process-local, so a second server instance would report only the visitors that
 * beat against it — each visitor is counted by whichever instance they happen to
 * hit. Fine while there is exactly one process; a shared store is a deployment
 * decision we have not made.
 */
const visitors = new Map<string, PresenceEntry>();

/** Visitor ids come from the client; cap them so a hostile client cannot bloat the map. */
const MAX_VISITOR_ID_LENGTH = 64;
const MAX_PATH_LENGTH = 200;

function isUsableVisitorId(visitorId: unknown): visitorId is string {
  const isString = typeof visitorId === 'string';
  if (!isString) return false;

  const trimmedId = visitorId.trim();
  const hasContent = trimmedId.length > 0;
  const isWithinLimit = trimmedId.length <= MAX_VISITOR_ID_LENGTH;
  return hasContent && isWithinLimit;
}

function normalisePath(path: unknown): string {
  const isString = typeof path === 'string';
  if (!isString || path.length === 0) return '/';

  return path.length > MAX_PATH_LENGTH ? path.slice(0, MAX_PATH_LENGTH) : path;
}

/** Drops visitors whose last beat is older than the TTL. */
function pruneExpiredVisitors(now: number): void {
  for (const [visitorId, entry] of visitors) {
    const isExpired = now - entry.lastSeenAt > PRESENCE_TTL_MILLISECS;
    if (isExpired) visitors.delete(visitorId);
  }
}

/** Counts visitors seen within the TTL, without mutating the map. */
export function countActiveVisitors(now: number = Date.now()): number {
  let activeCount = 0;
  for (const entry of visitors.values()) {
    const isActive = now - entry.lastSeenAt <= PRESENCE_TTL_MILLISECS;
    if (isActive) activeCount += 1;
  }

  return activeCount;
}

/** The route's answer: the count plus the cadence the client should beat at. */
export function readPresenceSnapshot(now: number = Date.now()): PresenceSnapshot {
  return {
    count: countActiveVisitors(now),
    ttlMilliseconds: PRESENCE_TTL_MILLISECS,
    heartbeatIntervalMilliseconds: PRESENCE_HEARTBEAT_INTERVAL_MILLISECS,
  };
}

/**
 * Records one beat and returns the fresh snapshot.
 *
 * Returns `null` for an unusable visitor id rather than inventing one: the route
 * turns that into a 400, and the caller's failure is visible instead of silently
 * counted.
 */
export function recordHeartbeat(
  visitorId: unknown,
  path: unknown,
  now: number = Date.now()
): PresenceSnapshot | null {
  if (!isUsableVisitorId(visitorId)) return null;

  // `countActiveVisitors` filters expired entries read-only, so it cannot tell us
  // that someone just dropped out. The map's size before the prune can: any entry
  // it removes is a visitor who reached their TTL, and the beat below replaces
  // exactly one of them, so a repeat beat from someone still present nets to zero.
  const countBefore = visitors.size;
  pruneExpiredVisitors(now);
  visitors.set(visitorId.trim(), { lastSeenAt: now, path: normalisePath(path) });

  const snapshot = readPresenceSnapshot(now);
  if (snapshot.count !== countBefore) {
    debugLog(
      `👥 [presence] readers ${countBefore} -> ${snapshot.count} (${snapshot.count > countBefore ? 'joined' : 'left'}, ${normalisePath(path)})`
    );
  }

  return snapshot;
}

/** Test seam: clears the registry so one test cannot see another's visitors. */
export function resetPresenceRegistry(): void {
  visitors.clear();
}
