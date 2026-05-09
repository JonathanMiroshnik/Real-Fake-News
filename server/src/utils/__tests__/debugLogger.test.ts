import { describe, it, expect, vi, beforeEach } from 'vitest';
import { debugLog, debugWarn, debugError } from '../debugLogger.js';

describe('debugLogger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.DEBUG_LOGS;
  });

  describe('when DEBUG_LOGS is "true"', () => {
    beforeEach(() => {
      process.env.DEBUG_LOGS = 'true';
    });

    it('debugLog should call console.log with provided args', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      debugLog('test message', 123);
      expect(spy).toHaveBeenCalledWith('test message', 123);
    });

    it('debugWarn should call console.warn with provided args', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      debugWarn('warning message');
      expect(spy).toHaveBeenCalledWith('warning message');
    });

    it('debugError should call console.error with provided args', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      debugError('error message');
      expect(spy).toHaveBeenCalledWith('error message');
    });

    it('should handle multiple arguments', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      debugLog('a', 'b', 'c');
      expect(spy).toHaveBeenCalledWith('a', 'b', 'c');
    });
  });

  describe('when DEBUG_LOGS is not set', () => {
    beforeEach(() => {
      delete process.env.DEBUG_LOGS;
    });

    it('debugLog should not call console.log', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      debugLog('should not appear');
      expect(spy).not.toHaveBeenCalled();
    });

    it('debugWarn should not call console.warn', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      debugWarn('should not appear');
      expect(spy).not.toHaveBeenCalled();
    });

    it('debugError should not call console.error', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      debugError('should not appear');
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('when DEBUG_LOGS is "false"', () => {
    beforeEach(() => {
      process.env.DEBUG_LOGS = 'false';
    });

    it('debugLog should not call console.log', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      debugLog('should not appear');
      expect(spy).not.toHaveBeenCalled();
    });

    it('debugWarn should not call console.warn', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      debugWarn('should not appear');
      expect(spy).not.toHaveBeenCalled();
    });

    it('debugError should not call console.error', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      debugError('should not appear');
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
