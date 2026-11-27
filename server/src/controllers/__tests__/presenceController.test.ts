import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

/**
 * Controller-level tests for the two presence endpoints and the freshness read.
 *
 * The HTTP contract is the point here, not the logic (which the service tests pin):
 * - a heartbeat with no usable `visitorId` is a **400**, not a silently ignored
 *   beat, so a broken client is visible instead of being counted as zero;
 * - a service failure is a **500**, so the indicator never sees a 200 with a
 *   made-up number;
 * - the freshness route answers with the service's own shape, unaltered.
 */
const { mockRecordHeartbeat, mockReadPresenceSnapshot, mockReadGenerationStatus } = vi.hoisted(
  () => ({
    mockRecordHeartbeat: vi.fn(),
    mockReadPresenceSnapshot: vi.fn(),
    mockReadGenerationStatus: vi.fn(),
  }),
);

vi.mock('../../services/presenceService.js', () => ({
  recordHeartbeat: mockRecordHeartbeat,
  readPresenceSnapshot: mockReadPresenceSnapshot,
}));

vi.mock('../../services/generationStatusService.js', () => ({
  readGenerationStatus: mockReadGenerationStatus,
}));

import {
  getPresenceController,
  postPresenceHeartbeatController,
  getGenerationStatusController,
} from '../presenceController.js';

function createMockResponse(): Response {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

const SNAPSHOT = { count: 3, ttlMilliseconds: 45_000, heartbeatIntervalMilliseconds: 15_000 };

describe('presenceController', () => {
  let mockResponse: Response;

  beforeEach(() => {
    mockResponse = createMockResponse();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('GET /api/presence', () => {
    it('returns the current snapshot', () => {
      mockReadPresenceSnapshot.mockReturnValue(SNAPSHOT);

      getPresenceController({} as Request, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith(SNAPSHOT);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('returns 500 when the service throws', () => {
      mockReadPresenceSnapshot.mockImplementation(() => {
        throw new Error('registry gone');
      });

      getPresenceController({} as Request, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to read presence' });
    });
  });

  describe('POST /api/presence/heartbeat', () => {
    it('passes the visitor id and path through and returns the snapshot', () => {
      mockRecordHeartbeat.mockReturnValue(SNAPSHOT);
      const request = { body: { visitorId: 'visitor-a', path: '/category/sports' } } as Request;

      postPresenceHeartbeatController(request, mockResponse);

      expect(mockRecordHeartbeat).toHaveBeenCalledWith('visitor-a', '/category/sports');
      expect(mockResponse.json).toHaveBeenCalledWith(SNAPSHOT);
    });

    it('copes with a request that carries no body at all', () => {
      mockRecordHeartbeat.mockReturnValue(null);

      postPresenceHeartbeatController({} as unknown as Request, mockResponse);

      expect(mockRecordHeartbeat).toHaveBeenCalledWith(undefined, undefined);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('rejects an unusable visitor id with 400', () => {
      mockRecordHeartbeat.mockReturnValue(null);
      const request = { body: { visitorId: 42 } } as Request;

      postPresenceHeartbeatController(request, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'A non-empty visitorId is required',
      });
    });

    it('returns 500 when the service throws', () => {
      mockRecordHeartbeat.mockImplementation(() => {
        throw new Error('registry gone');
      });
      const request = { body: { visitorId: 'visitor-a' } } as Request;

      postPresenceHeartbeatController(request, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to record heartbeat' });
    });
  });

  describe('GET /api/generation/status', () => {
    it('returns the status answer unchanged', () => {
      const status = {
        lastGeneratedAt: '2026-11-17T11:00:00.000Z',
        isGenerating: true,
      };
      mockReadGenerationStatus.mockReturnValue(status);

      getGenerationStatusController({} as Request, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith(status);
    });

    it('returns 500 when the query fails', () => {
      mockReadGenerationStatus.mockImplementation(() => {
        throw new Error('no such table');
      });

      getGenerationStatusController({} as Request, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to read generation status' });
    });
  });
});
