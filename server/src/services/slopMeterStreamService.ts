/**
 * Fan-out hub for the Slop meter's Server-Sent Events stream.
 *
 * The stream carries **no payload**: every event only says "the reading you
 * already know about may have changed, re-fetch it over REST". REST therefore
 * stays the single source of truth (see `contracts/architecture.md`) and this
 * module never has to format the reading for two different transports.
 *
 * Three safeguards exist because a long-lived connection breaks assumptions a
 * short request never tests, and all three were measured rather than assumed:
 *
 * 1. **Backpressure.** `res.write()` never throws for a slow client; it queues
 *    in this process. A client that stops reading while never closing
 *    accumulated 16 MB per connection in a local measurement, so a client that
 *    stays over `MAX_BUFFERED_BYTES` is dropped instead of buffered.
 * 2. **An `error` listener on every response.** An unhandled `error` event
 *    reaches `index.ts`, which treats any uncaught exception as fatal — one
 *    dead tab would otherwise restart the whole server.
 * 3. **A heartbeat,** so a proxy does not mistake an idle stream for a dead one
 *    and so vanished clients are noticed and reaped.
 */
import type { Response } from 'express';
import { debugLog } from '../utils/debugLogger.js';

/** Event name the browser listens for; named events need `addEventListener`. */
export const SLOP_METER_CHANGED_EVENT = 'reading-changed';

/** Comment line sent on an idle stream to keep it alive and to prove liveness. */
const HEARTBEAT_FRAME = ': keep-alive\n\n';

/**
 * Heartbeat period in milliseconds.
 *
 * Chosen against the proxies in front of this server, not against latency: they
 * treat a stream as dead after ~60 s of silence. Sent every 25 s, so two may be
 * lost before anything gives up. A shorter period buys nothing — the reading
 * changes when the server restarts, not milliseconds after `write()`.
 */
export const HEARTBEAT_INTERVAL_MS = 25_000;

/**
 * How long a client may keep its send buffer over the cap before it is dropped.
 *
 * One heartbeat of grace, so a brief stall (a phone switching networks) is
 * forgiven while a genuinely dead client is reaped within a minute.
 */
const BACKPRESSURE_GRACE_MS = HEARTBEAT_INTERVAL_MS;

/** Buffered bytes above which a client is considered unable to keep up. */
const MAX_BUFFERED_BYTES = 64 * 1024;

/** Clients currently attached to the stream. */
const subscribers = new Set<Response>();

/** Timer driving heartbeats and backpressure reaping; `null` when idle. */
let heartbeatTimer: NodeJS.Timeout | null = null;

/** Timestamp at which each stalled client first went over the cap. */
const stalledSince = new WeakMap<Response, number>();

/**
 * Reports the current subscriber count to the server log.
 *
 * This is the only place the count is ever exposed. It is deliberately a log
 * line and not an HTTP field: `/api/health` is public and unauthenticated, so a
 * connected-client count there is a rough estimate of the audience for anyone
 * who polls it. `DEBUG_LOGS=true` makes these lines visible; the default is a
 * no-op.
 *
 * Worth watching because the hub holds sockets that outlive any request: if the
 * count climbs and never falls, clients are leaking and nothing else would say so.
 *
 * @param reason Event that changed the count, for the log line.
 */
function logSubscriberCount(reason: string): void {
  debugLog(`Slop meter stream: ${reason}, ${subscribers.size} client(s) attached`);
}

/**
 * Sends one frame to a client, dropping it if it cannot keep up.
 *
 * `write()` returning `false` is normal and ignored here — the real signal is
 * `writableLength`, because the queue is what exhausts memory.
 *
 * @param client Attached response object.
 * @param frame Text to write, already framed.
 */
function writeFrame(client: Response, frame: string): void {
  if (client.destroyed || client.writableEnded) {
    detach(client);
    return;
  }

  const now = Date.now();
  const overflowedAt = stalledSince.get(client);

  if (client.writableLength > MAX_BUFFERED_BYTES) {
    const firstSeenAt = overflowedAt ?? now;
    stalledSince.set(client, firstSeenAt);

    const hasStalledTooLong = now - firstSeenAt >= BACKPRESSURE_GRACE_MS;
    if (hasStalledTooLong) {
      debugLog('Slop meter stream: dropping client that stopped reading');
      client.destroy();
      detach(client);
      return;
    }
  } else {
    stalledSince.delete(client);
  }

  try {
    client.write(frame);
  } catch (error) {
    debugLog('Slop meter stream: write failed, dropping client', error);
    detach(client);
  }
}

/**
 * Stops the heartbeat once the last client leaves.
 *
 * Leaving a periodic timer running on an idle server would keep the event loop
 * alive forever, which turns a graceful shutdown into a hang.
 */
function stopHeartbeatIfUnused(): void {
  if (subscribers.size > 0 || heartbeatTimer === null) {
    return;
  }

  clearInterval(heartbeatTimer);
  heartbeatTimer = null;
}

/**
 * Starts the heartbeat if it is not already running.
 *
 * `unref()` lets the process exit without waiting for the next tick.
 */
function startHeartbeatIfNeeded(): void {
  if (heartbeatTimer !== null) {
    return;
  }

  heartbeatTimer = setInterval(() => {
    for (const client of subscribers) {
      writeFrame(client, HEARTBEAT_FRAME);
    }
    stopHeartbeatIfUnused();
  }, HEARTBEAT_INTERVAL_MS);

  heartbeatTimer.unref();
}

/**
 * Removes a client from the hub.
 *
 * @param client Response to detach; unknown responses are ignored.
 */
function detach(client: Response): void {
  const wasAttached = subscribers.delete(client);
  stalledSince.delete(client);
  stopHeartbeatIfUnused();

  if (wasAttached) {
    logSubscriberCount('client detached');
  }
}

/**
 * Sends headers that make a response a live event stream.
 *
 * `no-transform` stops a proxy from re-encoding the body, and
 * `X-Accel-Buffering: no` is the per-response way to tell nginx not to buffer
 * it — belt and braces with the `proxy_buffering off` in `client/nginx.conf`,
 * because the shared nginx in front of the client has to be configured too.
 *
 * @param client Response to convert.
 */
function writeStreamHeaders(client: Response): void {
  client.status(200);
  client.set({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  client.flushHeaders();
}

/**
 * Tells one client that the reading may have changed.
 *
 * @param client Response to notify.
 */
function sendReadingChanged(client: Response): void {
  writeFrame(client, `event: ${SLOP_METER_CHANGED_EVENT}\ndata: {}\n\n`);
}

/**
 * Attaches a client to the stream.
 *
 * Sends an initial event so the browser has something before the first change,
 * then keeps the connection open. The caller must not write to the response
 * afterwards — the hub owns it until the client disconnects.
 *
 * @param client Response to convert into an event stream.
 */
export function attachSlopMeterClient(client: Response): void {
  writeStreamHeaders(client);
  client.write(`retry: ${HEARTBEAT_INTERVAL_MS}\n\n`);

  subscribers.add(client);
  startHeartbeatIfNeeded();
  logSubscriberCount('client attached');

  // `close` covers a tidy disconnect; `error` is mandatory because an unhandled
  // error here would reach the fatal handler in index.ts.
  client.on('close', () => detach(client));
  client.on('error', () => detach(client));

  sendReadingChanged(client);
}

/**
 * Tells every attached client that the reading may have changed.
 *
 * Deliberately sends no reading: clients re-fetch over REST, so a change in the
 * payload shape never invalidates this stream.
 *
 * @returns How many clients were notified.
 */
export function broadcastSlopMeterChanged(): number {
  for (const client of subscribers) {
    sendReadingChanged(client);
  }
  return subscribers.size;
}

/**
 * Disconnects every client and stops the heartbeat.
 *
 * Needed before `server.close()`: that call waits for open connections to end,
 * and an SSE response never ends on its own, so graceful shutdown would
 * otherwise hang forever.
 */
export function closeSlopMeterStream(): void {
  for (const client of subscribers) {
    client.end();
  }
  subscribers.clear();
  stopHeartbeatIfUnused();
  logSubscriberCount('stream closed');
}
