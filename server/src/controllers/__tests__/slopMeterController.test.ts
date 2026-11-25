import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response } from 'express';

/* ------------------------------------------------------------------ */
/*  Mock factories — vi.hoisted() is required for ESM compatibility    */
/* ------------------------------------------------------------------ */

const { mockGetSlopMeterReading, mockAttach, mockBroadcast } = vi.hoisted(() => ({
  mockGetSlopMeterReading: vi.fn(),
  mockAttach: vi.fn(),
  mockBroadcast: vi.fn(),
}));

vi.mock('../../services/slopMeterService.js', () => ({
  getSlopMeterReading: mockGetSlopMeterReading,
}));

vi.mock('../../services/slopMeterStreamService.js', () => ({
  attachSlopMeterClient: mockAttach,
  broadcastSlopMeterChanged: mockBroadcast,
}));

import {
  getSlopMeter,
  getSlopMeterStream,
  notifySlopMeterChanged,
} from '../slopMeterController.js';

function createMockResponse(): Response {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  res.headersSent = false;
  return res as Response;
}

describe('Slop Meter Controller', () => {
  let mockRes: Response;

  beforeEach(() => {
    mockRes = createMockResponse();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('getSlopMeter', () => {
    it('responds 200 with the reading from the service', () => {
      const reading = { intelligence: 88, model: 'deepseek-reasoner' };
      mockGetSlopMeterReading.mockReturnValue(reading);

      getSlopMeter({} as Request, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ success: true, reading });
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('responds 500 when the service throws', () => {
      mockGetSlopMeterReading.mockImplementation(() => {
        throw new Error('boom');
      });

      getSlopMeter({} as Request, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to read slop meter',
      });
    });
  });

  describe('getSlopMeterStream', () => {
    it('hands the response to the stream hub', () => {
      getSlopMeterStream({} as Request, mockRes);

      expect(mockAttach).toHaveBeenCalledWith(mockRes);
      // The hub owns the response from here; the controller must not answer.
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('responds 500 when the stream cannot be opened', () => {
      mockAttach.mockImplementation(() => {
        throw new Error('boom');
      });

      getSlopMeterStream({} as Request, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to open slop meter stream',
      });
    });

    it('only ends the response when headers were already sent', () => {
      mockAttach.mockImplementation(() => {
        throw new Error('boom');
      });
      (mockRes as { headersSent: boolean }).headersSent = true;

      getSlopMeterStream({} as Request, mockRes);

      expect(mockRes.end).toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('notifySlopMeterChanged', () => {
    it('broadcasts in development', () => {
      vi.stubEnv('NODE_ENV', 'development');
      mockBroadcast.mockReturnValue(3);

      notifySlopMeterChanged({} as Request, mockRes);

      expect(mockBroadcast).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(202);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, notifiedCount: 3 });
    });

    it('is invisible outside development', () => {
      vi.stubEnv('NODE_ENV', 'production');

      notifySlopMeterChanged({} as Request, mockRes);

      expect(mockBroadcast).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });
});
