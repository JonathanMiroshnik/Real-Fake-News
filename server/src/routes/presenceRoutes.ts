/**
 * Live-presence routes. Mounted at `/presence` in `apiRoutes.ts`.
 *
 * There is no `/:id` route here, so nothing has to be ordered against the other
 * routers; the whole prefix is new namespace (`/api/presence`, `/api/generation`).
 */
import { Router } from 'express';
import {
  getPresenceController,
  postPresenceHeartbeatController,
} from '../controllers/presenceController.js';

const presenceRoutes = Router();

presenceRoutes.get('/', getPresenceController);
presenceRoutes.post('/heartbeat', postPresenceHeartbeatController);

export default presenceRoutes;
