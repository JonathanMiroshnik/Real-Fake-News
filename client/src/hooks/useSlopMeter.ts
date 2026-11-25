import { useCallback, useEffect, useState } from 'react';
import {
  fetchSlopMeterReading,
  openSlopMeterStream,
  SlopMeterReading,
} from '../services/slopMeterService';

/** Window event that asks every mounted Slop meter to re-fetch. */
export const SLOP_METER_REFRESH_EVENT = 'slop-meter:refresh';

/**
 * Loads the Slop meter reading from the API.
 *
 * Fetches once on mount, again whenever `notifySlopMeterChanged()` fires, and
 * again whenever the server announces a change on its event stream. There is no
 * timer: the reading only changes when the server restarts with a different
 * model, so polling would spend requests proving nothing — the stream says so
 * only when there is something to say.
 *
 * @returns The current reading (`null` while loading or after a failed fetch),
 *          `isLoading`, and a manual refresh.
 */
export function useSlopMeter() {
  const [reading, setReading] = useState<SlopMeterReading | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    const nextReading = await fetchSlopMeterReading(signal);

    if (signal?.aborted) {
      return;
    }

    setReading(nextReading);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const handleRefreshRequest = () => refresh(controller.signal);

    // Stream first, fetch second: the server sends an event on connect, so
    // subscribing before the initial fetch guarantees no change is missed in
    // the gap between the two.
    const closeStream = openSlopMeterStream({
      onReadingChanged: handleRefreshRequest,
    });

    refresh(controller.signal);
    window.addEventListener(SLOP_METER_REFRESH_EVENT, handleRefreshRequest);

    return () => {
      closeStream();
      controller.abort();
      window.removeEventListener(SLOP_METER_REFRESH_EVENT, handleRefreshRequest);
    };
  }, [refresh]);

  return { reading, isLoading, refresh };
}

/**
 * Asks every mounted Slop meter in this tab to re-fetch its reading.
 *
 * For manually watching the CSS transition: restart the server with another
 * `DEEPSEEK_MODEL`, then call `notifySlopMeterChanged()` in the browser console.
 */
export function notifySlopMeterChanged(): void {
  window.dispatchEvent(new Event(SLOP_METER_REFRESH_EVENT));
}
