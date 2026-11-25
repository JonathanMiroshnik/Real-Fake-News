import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchSlopMeterReading,
  openSlopMeterStream,
  parseSlopMeterReading,
  SLOP_METER_CHANGED_EVENT,
} from '../slopMeterService.ts';

vi.mock('../../config/apiConfig', () => ({
  getApiBaseUrlWithPrefix: () => '/api',
}));

function mockJsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as Response;
}

describe('slopMeterService (client)', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('parseSlopMeterReading', () => {
    const validReading = { model: 'deepseek-chat', intelligence: 64 };

    it('returns the reading when the payload is a success envelope', () => {
      expect(parseSlopMeterReading({ success: true, reading: validReading })).toEqual(validReading);
    });

    it('clamps a score outside 0–100 instead of letting it overflow the bar', () => {
      expect(parseSlopMeterReading({ success: true, reading: { model: 'x', intelligence: 250 } })).toEqual({
        model: 'x',
        intelligence: 100,
      });
      expect(parseSlopMeterReading({ success: true, reading: { model: 'x', intelligence: -10 } })).toEqual({
        model: 'x',
        intelligence: 0,
      });
    });

    it('rejects a non-finite score rather than drawing an unreadable bar', () => {
      const cases = [
        { success: true, reading: { model: 'x', intelligence: Number.NaN } },
        { success: true, reading: { model: 'x', intelligence: Number.POSITIVE_INFINITY } },
      ];

      for (const body of cases) {
        expect(parseSlopMeterReading(body)).toBeNull();
      }
    });

    it('rejects a payload with no usable model name', () => {
      expect(parseSlopMeterReading({ success: true, reading: { model: '', intelligence: 10 } })).toBeNull();
      expect(parseSlopMeterReading({ success: true, reading: { intelligence: 10 } })).toBeNull();
    });

    it('rejects a failed envelope, a missing reading, and non-objects', () => {
      const cases = [undefined, null, 42, 'html', {}, { success: false }, { success: true }];

      for (const body of cases) {
        expect(parseSlopMeterReading(body)).toBeNull();
      }
    });
  });

  describe('fetchSlopMeterReading', () => {
    it('requests the slop-meter endpoint and returns the reading', async () => {
      fetchMock.mockResolvedValue(
        mockJsonResponse({ success: true, reading: { model: 'deepseek-chat', intelligence: 64 } }),
      );

      const reading = await fetchSlopMeterReading();

      expect(fetchMock).toHaveBeenCalledWith('/api/slop-meter', expect.anything());
      expect(reading).toEqual({ model: 'deepseek-chat', intelligence: 64 });
    });

    it('clamps an out-of-range score instead of letting it overflow the bar', async () => {
      fetchMock.mockResolvedValue(
        mockJsonResponse({ success: true, reading: { model: 'x', intelligence: 250 } }),
      );

      const reading = await fetchSlopMeterReading();

      expect(reading?.intelligence).toBe(100);
    });

    it('returns null when the server answers with an error status', async () => {
      fetchMock.mockResolvedValue(mockJsonResponse({ success: false }, false, 500));

      expect(await fetchSlopMeterReading()).toBeNull();
    });

    it('returns null when the payload has no model name', async () => {
      fetchMock.mockResolvedValue(
        mockJsonResponse({ success: true, reading: { model: '', intelligence: 10 } }),
      );

      expect(await fetchSlopMeterReading()).toBeNull();
    });

    it('returns null when the request itself fails', async () => {
      fetchMock.mockRejectedValue(new Error('offline'));

      expect(await fetchSlopMeterReading()).toBeNull();
    });

    it('returns null when the body is not JSON, as when a proxy returns HTML', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError('Unexpected token <');
        },
      } as unknown as Response);

      expect(await fetchSlopMeterReading()).toBeNull();
    });
  });

  describe('openSlopMeterStream', () => {
    /** Minimal `EventSource` stand-in, recording how it was used. */
    class FakeEventSource {
      static instances: FakeEventSource[] = [];
      url: string;
      listeners = new Map<string, EventListener>();
      close = vi.fn();

      constructor(url: string) {
        this.url = url;
        FakeEventSource.instances.push(this);
      }

      addEventListener(type: string, listener: EventListener): void {
        this.listeners.set(type, listener);
      }

      removeEventListener(type: string): void {
        this.listeners.delete(type);
      }

      emit(type: string): void {
        this.listeners.get(type)?.(new Event(type));
      }
    }

    beforeEach(() => {
      FakeEventSource.instances = [];
      vi.stubGlobal('EventSource', FakeEventSource);
    });

    it('subscribes to the stream endpoint under the API prefix', () => {
      openSlopMeterStream({ onReadingChanged: vi.fn() });

      expect(FakeEventSource.instances[0].url).toBe('/api/slop-meter/stream');
    });

    it('calls back on the named change event', () => {
      const onReadingChanged = vi.fn();
      openSlopMeterStream({ onReadingChanged });

      FakeEventSource.instances[0].emit(SLOP_METER_CHANGED_EVENT);

      expect(onReadingChanged).toHaveBeenCalledTimes(1);
    });

    it('does not rely on onmessage for a named event', () => {
      const onReadingChanged = vi.fn();
      openSlopMeterStream({ onReadingChanged });

      // Named events never reach the default message handler, which is why the
      // service registers an explicit listener instead.
      FakeEventSource.instances[0].emit('message');

      expect(onReadingChanged).not.toHaveBeenCalled();
    });

    it('leaves reconnection to the browser when the stream drops', () => {
      openSlopMeterStream({ onReadingChanged: vi.fn() });

      FakeEventSource.instances[0].emit('error');

      // Closing here would disable EventSource's own retry loop.
      expect(FakeEventSource.instances[0].close).not.toHaveBeenCalled();
    });

    it('closes the stream when the returned closer is called', () => {
      const closeStream = openSlopMeterStream({ onReadingChanged: vi.fn() });

      closeStream();

      expect(FakeEventSource.instances[0].close).toHaveBeenCalledTimes(1);
    });

    it('stops calling back after the closer runs', () => {
      const onReadingChanged = vi.fn();
      const closeStream = openSlopMeterStream({ onReadingChanged });

      closeStream();
      FakeEventSource.instances[0].emit(SLOP_METER_CHANGED_EVENT);

      expect(onReadingChanged).not.toHaveBeenCalled();
    });

    it('degrades to a no-op when EventSource is unavailable', () => {
      vi.unstubAllGlobals();

      // Throwing here would happen inside the caller's effect and take the
      // whole widget down; losing live updates must not cost the meter.
      const closeStream = openSlopMeterStream({ onReadingChanged: vi.fn() });

      expect(() => closeStream()).not.toThrow();
    });
  });
});
