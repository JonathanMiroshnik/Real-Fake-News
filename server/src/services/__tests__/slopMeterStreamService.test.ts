import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'node:events';
import type { Response } from 'express';

vi.mock('../../utils/debugLogger.js', () => ({ debugLog: vi.fn(), debugError: vi.fn() }));

import { debugLog } from '../../utils/debugLogger.js';
import {
  attachSlopMeterClient,
  broadcastSlopMeterChanged,
  closeSlopMeterStream,
  HEARTBEAT_INTERVAL_MS,
  SLOP_METER_CHANGED_EVENT,
} from '../slopMeterStreamService.js';

/** Minimal stand-in for an Express response, with a real emitter behind it. */
class FakeResponse extends EventEmitter {
  status = vi.fn().mockReturnThis();
  set = vi.fn().mockReturnThis();
  flushHeaders = vi.fn();
  write = vi.fn().mockReturnValue(true);
  end = vi.fn();
  destroy = vi.fn(() => this.markDestroyed());
  destroyed = false;
  writableEnded = false;
  writableLength = 0;

  markDestroyed(): void {
    this.destroyed = true;
  }

  asResponse(): Response {
    return this as unknown as Response;
  }
}

/** Text of every frame written to a fake client. */
function framesOf(client: FakeResponse): string[] {
  return client.write.mock.calls.map((call) => String(call[0]));
}

/**
 * Whether any `debugLog` line reports `count` attached clients.
 *
 * The subscriber count is only ever exposed through this log line — there is no
 * HTTP field for it — so the log is the observable behaviour worth asserting.
 *
 * @param count Expected client count in the log line.
 * @returns True if some line carries that count.
 */
function loggedCount(count: number): boolean {
  return vi
    .mocked(debugLog)
    .mock.calls.map((call) => call.map(String).join(' '))
    .some((line) => line.includes(`${count} client(s) attached`));
}

describe('slopMeterStreamService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    closeSlopMeterStream();
    vi.useRealTimers();
  });

  describe('attachSlopMeterClient', () => {
    it('sends stream headers that disable proxy buffering', () => {
      const client = new FakeResponse();

      attachSlopMeterClient(client.asResponse());

      expect(client.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Type': 'text/event-stream; charset=utf-8',
          'X-Accel-Buffering': 'no',
        }),
      );
      expect(client.flushHeaders).toHaveBeenCalled();
      expect(loggedCount(1)).toBe(true);
    });

    it('sends a retry hint and an initial change event', () => {
      const client = new FakeResponse();

      attachSlopMeterClient(client.asResponse());

      const frames = framesOf(client);
      expect(frames[0]).toBe(`retry: ${HEARTBEAT_INTERVAL_MS}\n\n`);
      expect(frames[1]).toContain(`event: ${SLOP_METER_CHANGED_EVENT}`);
    });

    it('carries no reading in the event payload', () => {
      const client = new FakeResponse();

      attachSlopMeterClient(client.asResponse());

      // The client must re-fetch over REST; a payload here would duplicate it.
      expect(framesOf(client)[1]).toContain('data: {}');
    });
  });

  describe('client removal', () => {
    it('forgets a client that closes', () => {
      const client = new FakeResponse();
      attachSlopMeterClient(client.asResponse());

      client.emit('close');

      expect(loggedCount(0)).toBe(true);
    });

    it('forgets a client that errors instead of crashing the process', () => {
      const client = new FakeResponse();
      attachSlopMeterClient(client.asResponse());

      // Without an error listener this throw reaches index.ts and shuts down
      // the whole server, so emitting must be safe rather than fatal.
      expect(() => client.emit('error', new Error('socket hang up'))).not.toThrow();
      expect(loggedCount(0)).toBe(true);
    });

    it('stops writing after the client closes', () => {
      const client = new FakeResponse();
      attachSlopMeterClient(client.asResponse());
      client.emit('close');
      client.write.mockClear();

      broadcastSlopMeterChanged();

      expect(client.write).not.toHaveBeenCalled();
    });
  });

  describe('heartbeat', () => {
    it('sends a comment frame each interval', () => {
      const client = new FakeResponse();
      attachSlopMeterClient(client.asResponse());
      client.write.mockClear();

      vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);

      expect(framesOf(client)).toEqual([': keep-alive\n\n']);
    });

    it('uses one shared timer for every client', () => {
      const firstClient = new FakeResponse();
      const secondClient = new FakeResponse();
      attachSlopMeterClient(firstClient.asResponse());
      attachSlopMeterClient(secondClient.asResponse());
      firstClient.write.mockClear();
      secondClient.write.mockClear();

      vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);

      expect(framesOf(firstClient)).toEqual([': keep-alive\n\n']);
      expect(framesOf(secondClient)).toEqual([': keep-alive\n\n']);
    });

    it('stops beating once the last client leaves', () => {
      const client = new FakeResponse();
      attachSlopMeterClient(client.asResponse());
      client.emit('close');
      client.write.mockClear();

      vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS * 3);

      expect(client.write).not.toHaveBeenCalled();
    });
  });

  describe('backpressure', () => {
    it('keeps a briefly stalled client', () => {
      const client = new FakeResponse();
      attachSlopMeterClient(client.asResponse());
      client.writableLength = 1024 * 1024;

      // First heartbeat over the cap only starts the clock.
      vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);

      expect(client.destroy).not.toHaveBeenCalled();
      expect(loggedCount(1)).toBe(true);
    });

    it('drops a client that stays over the cap', () => {
      const client = new FakeResponse();
      attachSlopMeterClient(client.asResponse());
      client.writableLength = 1024 * 1024;

      vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS * 2);

      // Measured locally at 16 MB queued for one vanished peer: dropping beats
      // buffering, which is what `write()` alone would do silently.
      expect(client.destroy).toHaveBeenCalled();
      expect(loggedCount(0)).toBe(true);
    });

    it('forgives a client whose buffer drains again', () => {
      const client = new FakeResponse();
      attachSlopMeterClient(client.asResponse());
      client.writableLength = 1024 * 1024;
      vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);

      client.writableLength = 0;
      vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS * 3);

      expect(client.destroy).not.toHaveBeenCalled();
      expect(loggedCount(1)).toBe(true);
    });
  });

  describe('closeSlopMeterStream', () => {
    it('ends every client and empties the hub', () => {
      const firstClient = new FakeResponse();
      const secondClient = new FakeResponse();
      attachSlopMeterClient(firstClient.asResponse());
      attachSlopMeterClient(secondClient.asResponse());

      closeSlopMeterStream();

      // Without this, server.close() waits forever on open SSE responses.
      expect(firstClient.end).toHaveBeenCalled();
      expect(secondClient.end).toHaveBeenCalled();
      expect(loggedCount(0)).toBe(true);
    });

    it('is safe to call when nothing is attached', () => {
      expect(() => closeSlopMeterStream()).not.toThrow();
    });
  });
});
