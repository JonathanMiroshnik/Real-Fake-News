/**
 * Drives the header's presence indicator.
 *
 * Two polls, at two different rhythms, because the two facts change at very
 * different speeds:
 * - presence: every `heartbeatIntervalMilliseconds` the server asks for (~15 s),
 *   and immediately on a route change so the recorded path is never stale;
 * - generation status: every `GENERATION_STATUS_POLL_MILLISECS`, and whenever the visitor
 *   count changes, since a new arrival is the moment the count is most worth confirming.
 *
 * The indicator has three states, not two: `unknown` exists so a failed request
 * never renders as either green ("all fine") or yellow ("busy"). An error is not a
 * measurement.
 *
 * Polling rather than SSE: the endpoint is one small JSON read, it needs no
 * changes to either nginx layer, and a reader who closes the tab simply stops
 * beating — the server expires them on its own (`plans/features-status.md`).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import {
  fetchGenerationStatus,
  sendHeartbeat,
  type GenerationStatus,
} from '../services/presenceService';

/** Fallback beat cadence, used until the server's own number arrives. */
const DEFAULT_HEARTBEAT_INTERVAL_MILLISECS = 15_000;
/** How often to re-ask the read-only status question. */
const GENERATION_STATUS_POLL_MILLISECS = 60_000;

/** `unknown` is the honest answer when a poll failed. */
export type PresenceStatus = 'green' | 'yellow' | 'unknown';

export interface PresenceIndicatorState {
  status: PresenceStatus;
  visitorCount: number | null;
  generationStatus: GenerationStatus | null;
}

const IDLE_STATE: PresenceIndicatorState = {
  status: 'unknown',
  visitorCount: null,
  generationStatus: null,
};

/** Nothing was generated within the job's cadence, so the light is not yellow. */
function resolveStatus(status: GenerationStatus | null): PresenceStatus {
  if (!status) return 'unknown';
  return status.isGenerating ? 'yellow' : 'green';
}

/**
 * `document.visibilityState`, kept current.
 *
 * A backgrounded tab cannot show the indicator, and a reader who left one open
 * overnight should not keep inflating the count — the heartbeat stops and the
 * server expires them.
 */
function useDocumentVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(() => document.visibilityState === 'visible');

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return isVisible;
}

/**
 * @returns whether the indicator is green (fresh), yellow (generating) or unknown
 * (a request failed), plus the raw numbers behind it.
 */
export function usePresenceIndicator(): PresenceIndicatorState {
  const [state, setState] = useState<PresenceIndicatorState>(IDLE_STATE);
  const [heartbeatIntervalMilliseconds, setHeartbeatIntervalMilliseconds] = useState(
    DEFAULT_HEARTBEAT_INTERVAL_MILLISECS,
  );
  // `useLocation()` reports `null` for a component rendered outside a `<Routes>`
  // tree (and in tests). The path is only used to label the beat, so an unknown
  // route simply falls back to the current URL.
  const location = useLocation();
  const pathname = location?.pathname ?? window.location.pathname;
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  /** One beat: keeps this visitor alive and refreshes the count. */
  const beat = useCallback(async () => {
    const snapshot = await sendHeartbeat(pathRef.current);
    if (!snapshot) return; // Failed beat: the count is unknown, not zero.

    setHeartbeatIntervalMilliseconds(snapshot.heartbeatIntervalMilliseconds);
    setState((previous) => ({ ...previous, visitorCount: snapshot.count }));
  }, []);

  /** One status read: decides green vs yellow. */
  const refreshGenerationStatus = useCallback(async () => {
    const generationStatus = await fetchGenerationStatus();
    setState((previous) => ({
      ...previous,
      generationStatus,
      status: resolveStatus(generationStatus),
    }));
  }, []);

  // Both requests fire on mount, and again on a route change so the path the
  // server records always matches the page being read. Doing them outside an
  // effect would re-request on every render.
  useEffect(() => {
    void beat();
    void refreshGenerationStatus();
  }, [pathname, beat, refreshGenerationStatus]);

  // Steady polling while the tab is visible only.
  const isPolling = useDocumentVisibility();
  useEffect(() => {
    if (!isPolling) return;

    const heartbeatTimerId = setInterval(() => void beat(), heartbeatIntervalMilliseconds);
    const statusTimerId = setInterval(() => void refreshGenerationStatus(), GENERATION_STATUS_POLL_MILLISECS);
    return () => {
      clearInterval(heartbeatTimerId);
      clearInterval(statusTimerId);
    };
  }, [isPolling, heartbeatIntervalMilliseconds, beat, refreshGenerationStatus]);

  return state;
}

