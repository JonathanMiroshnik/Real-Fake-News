/**
 * Client side of the "Slop meter": a read-only fetch of what the server says
 * about the writer pipeline.
 *
 * The payload is deliberately dumb: a model name to display verbatim and a
 * 0–100 score. The client never decides which model is "current"; it only draws
 * what the backend reports, so the widget keeps working when the model changes
 * without a client release.
 */
import { getApiBaseUrlWithPrefix } from '../config/apiConfig';
import { debugError } from '../utils/debugLogger';

/** Reading as the server reports it (`GET /api/slop-meter`). */
export interface SlopMeterReading {
  /** Model name, drawn verbatim inside the info popup. */
  model: string;
  /** Writing intelligence, 0–100 (CSS-ready percentage). */
  intelligence: number;
}

/** Envelope returned by `GET /api/slop-meter`. */
interface SlopMeterResponse {
  success: boolean;
  reading?: SlopMeterReading;
  error?: string;
}

export const SLOP_METER_ENDPOINT = '/slop-meter';

/** Path of the event stream, relative to the API prefix. */
export const SLOP_METER_STREAM_ENDPOINT = `${SLOP_METER_ENDPOINT}/stream`;

/**
 * Event name the server sends when the reading may have changed.
 *
 * Must match `SLOP_METER_CHANGED_EVENT` on the server. It is a *named* event, so
 * it arrives on `addEventListener('reading-changed')` and never on `onmessage` —
 * listening to `onmessage` is the classic way to build a stream that looks
 * connected and never fires.
 */
export const SLOP_METER_CHANGED_EVENT = 'reading-changed';

/** Callbacks a caller supplies when opening the stream. */
export interface SlopMeterStreamHandlers {
  /** Called when the server says the reading may have changed. */
  onReadingChanged: () => void;
}

/**
 * Opens the reading-changed stream.
 *
 * Returns a closer instead of the `EventSource` itself: the caller only ever
 * needs to stop listening, and hiding the object makes it impossible to write
 * `source.close()` inside an error handler (which silently disables
 * `EventSource`'s own reconnect). Reconnecting is the browser's job.
 *
 * Degrades to a no-op when `EventSource` is unavailable — an old browser, or a
 * test environment without it. The meter then behaves exactly as it did before
 * the stream existed (initial fetch plus manual refresh) instead of throwing
 * inside the caller's effect and taking the widget down with it.
 *
 * @param handlers Callbacks invoked as events arrive.
 * @returns A function that closes the stream; safe to call more than once.
 */
export function openSlopMeterStream(handlers: SlopMeterStreamHandlers): () => void {
  if (typeof EventSource === 'undefined') {
    debugError('Slop meter: EventSource unavailable, live updates disabled');
    return () => undefined;
  }

  const streamUrl = getApiBaseUrlWithPrefix() + SLOP_METER_STREAM_ENDPOINT;
  const eventSource = new EventSource(streamUrl);

  const handleReadingChanged = () => handlers.onReadingChanged();

  eventSource.addEventListener(SLOP_METER_CHANGED_EVENT, handleReadingChanged);
  eventSource.addEventListener('error', () => {
    // No close(), no manual retry: the browser retries on its own and the
    // reading is already on screen, so a gap in the stream changes nothing.
    debugError('Slop meter: stream disconnected, the browser will retry');
  });

  return () => {
    eventSource.removeEventListener(SLOP_METER_CHANGED_EVENT, handleReadingChanged);
    eventSource.close();
  };
}

/**
 * Label rendered under the bar; also the meter's accessible name.
 */
export const SLOP_METER_INTELLIGENCE_LABEL = 'Current article writing intelligence';

/**
 * Turns an untrusted JSON body into a reading, or `null` if it is not one.
 *
 * This is the only place on the client that reads server bytes, so it is the
 * only place that has to prove they are usable. Everything downstream receives
 * a `SlopMeterReading` that is already known to be drawable, which is why
 * `SlopMeter` can put `intelligence` straight into a CSS percentage without a
 * clamp of its own.
 *
 * The returned score is clamped rather than rejected: a 250 is an overflow bug,
 * not an unreadable payload, so the widget still has something truthful to draw.
 * A non-finite score has no such reading, so the whole payload is refused — the
 * same answer as an unreachable server.
 *
 * @param body Parsed JSON, of unknown shape.
 * @returns A drawable reading, or `null` when the body is not one.
 */
export function parseSlopMeterReading(body: unknown): SlopMeterReading | null {
  const payload = body as SlopMeterResponse | null;
  if (!payload) {
      return null;
  }
  
  const reading = payload?.reading;
  const model = reading?.model;
  const intelligence = reading?.intelligence;

  const hasReading = payload?.success === true && reading !== undefined;
  const hasModelName = typeof model === 'string' && model.length > 0;
  const hasFiniteScore = typeof intelligence === 'number' && Number.isFinite(intelligence);

  if (!hasReading || !hasModelName || !hasFiniteScore) {
    return null;
  }

  return { model, intelligence: Math.min(100, Math.max(0, intelligence)) };
}

/**
 * Fetches the current reading.
 *
 * Transport failures and unreadable payloads are both reported as `null`
 * because the caller treats them identically: there is nothing to draw, so the
 * widget hides itself.
 *
 * @param signal Aborts the request when the component unmounts.
 * @returns A drawable reading, or `null` when there is nothing to show.
 */
export async function fetchSlopMeterReading(
  signal?: AbortSignal,
): Promise<SlopMeterReading | null> {
  try {
    const response = await fetch(getApiBaseUrlWithPrefix() + SLOP_METER_ENDPOINT, {
      signal,
    });

    if (!response.ok) {
      debugError(`Slop meter: HTTP ${response.status}`);
      return null;
    }

    const reading = parseSlopMeterReading(await response.json());

    if (reading === null) {
      debugError('Slop meter: unexpected payload');
    }

    return reading;
  } catch (error) {
    debugError('Slop meter: request failed', error);
    return null;
  }
}
