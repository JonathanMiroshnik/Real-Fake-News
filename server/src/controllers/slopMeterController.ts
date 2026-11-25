import { Request, Response } from 'express';
import { getSlopMeterReading, SlopMeterReading } from '../services/slopMeterService.js';
import {
  attachSlopMeterClient,
  broadcastSlopMeterChanged,
} from '../services/slopMeterStreamService.js';

/** Envelope returned by `GET /api/slop-meter`. */
export interface SlopMeterResponse {
  success: boolean;
  reading?: SlopMeterReading;
  error?: string;
}

/**
 * GET /api/slop-meter
 * Reports which model writes the articles and its intelligence score.
 *
 * Cached briefly by the client (see `useSlopMeter`): the reading only changes
 * when the server restarts with a different model, so it is the same answer for
 * every visitor.
 */
export const getSlopMeter = (_req: Request, res: Response): void => {
  try {
    const response: SlopMeterResponse = {
      success: true,
      reading: getSlopMeterReading(),
    };
    res.json(response);
  } catch (error) {
    console.error('Error reading slop meter:', error);
    const response: SlopMeterResponse = {
      success: false,
      error: 'Failed to read slop meter',
    };
    res.status(500).json(response);
  }
};

/**
 * GET /api/slop-meter/stream
 * Holds the response open and sends an event whenever the reading may have
 * changed.
 *
 * The stream carries no reading — each event asks the client to re-fetch
 * `GET /api/slop-meter`, so REST stays the source of truth. The hub owns the
 * response until the client disconnects; nothing after the attach may write to
 * it.
 */
export const getSlopMeterStream = (_req: Request, res: Response): void => {
  try {
    attachSlopMeterClient(res);
  } catch (error) {
    console.error('Error opening slop meter stream:', error);
    // The response may already be committed; ending it is all that is left.
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Failed to open slop meter stream' });
      return;
    }
    res.end();
  }
};

/**
 * POST /api/slop-meter/notify
 * Development-only trigger that tells every attached stream the reading changed.
 *
 * Exists because the reading only changes when the server restarts with another
 * `DEEPSEEK_MODEL`, at which point no client is connected — without this, the
 * stream could never be seen working. Refused outside development so it cannot
 * become an unauthenticated broadcast endpoint in production.
 *
 * @returns 202 with the number of clients notified, or 404 outside development.
 */
export const notifySlopMeterChanged = (_req: Request, res: Response): void => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!isDevelopment) {
    res.status(404).json({ success: false, error: 'Not found' });
    return;
  }

  const notifiedCount = broadcastSlopMeterChanged();
  res.status(202).json({ success: true, notifiedCount });
};
