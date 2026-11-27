/**
 * Presence endpoints, and the generation-status read, for the header indicator.
 *
 * Two tiny reads and one write of a counter. Nothing here touches a producer
 * pipeline, so mounting these on the client-facing router keeps the invariant in
 * `contracts/architecture.md` intact: a visitor's browser can ask "is anything
 * being generated?" but cannot cause generation.
 *
 * The generation-status handler lives here because the indicator is its only
 * caller and its only reason to exist; it is mounted from `routes/generationRoutes.ts`.
 */
import { Request, Response } from 'express';
import { recordHeartbeat, readPresenceSnapshot } from '../services/presenceService.js';
import { readGenerationStatus } from '../services/generationStatusService.js';
import { debugError } from '../utils/debugLogger.js';

/** `GET /api/presence` — who is connected right now. */
export function getPresenceController(req: Request, res: Response): void {
  try {
    res.json(readPresenceSnapshot());
  } catch (error) {
    debugError('❌ Failed to read presence:', error);
    res.status(500).json({ error: 'Failed to read presence' });
  }
}

/**
 * `POST /api/presence/heartbeat` — one visitor is still here.
 *
 * The body is `{ visitorId, path }`. A missing or malformed `visitorId` is a 400,
 * not a silently ignored beat: a client that never identifies itself would get
 * "0 connected" back and show a wrong number rather than a broken one.
 */
export function postPresenceHeartbeatController(req: Request, res: Response): void {
  try {
    const { visitorId, path } = (req.body ?? {}) as { visitorId?: unknown; path?: unknown };
    const snapshot = recordHeartbeat(visitorId, path);

    if (!snapshot) {
      res.status(400).json({ error: 'A non-empty visitorId is required' });
      return;
    }

    res.json(snapshot);
  } catch (error) {
    debugError('❌ Failed to record heartbeat:', error);
    res.status(500).json({ error: 'Failed to record heartbeat' });
  }
}

/** `GET /api/generation/status` — the indicator's traffic-light input. */
export function getGenerationStatusController(req: Request, res: Response): void {
  try {
    res.json(readGenerationStatus());
  } catch (error) {
    debugError('❌ Failed to read generation status:', error);
    res.status(500).json({ error: 'Failed to read generation status' });
  }
}
