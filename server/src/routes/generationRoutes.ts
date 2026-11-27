/**
 * Generation-status routes. Mounted at `/generation` in `apiRoutes.ts`.
 *
 * Read-only: the status read looks at when a producer last committed a row and
 * never writes, so exposing it to the client cannot start a pipeline.
 *
 * `status` is a verb-ish segment, not a collection member — there is exactly one
 * current status, and no `/:key` here, so nothing needs ordering against the other
 * routers.
 */
import { Router } from 'express';
import { getGenerationStatusController } from '../controllers/presenceController.js';

const generationRoutes = Router();

generationRoutes.get('/status', getGenerationStatusController);

export default generationRoutes;
