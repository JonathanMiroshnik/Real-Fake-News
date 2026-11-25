import { Router } from 'express';
import {
  getSlopMeter,
  getSlopMeterStream,
  notifySlopMeterChanged,
} from '../controllers/slopMeterController.js';

const router = Router();

// The stream and the dev trigger are registered before `/` so a future
// `router.use()` on `/` cannot shadow them.
router.get('/stream', getSlopMeterStream);
router.post('/notify', notifySlopMeterChanged);

router.get('/', getSlopMeter);

export default router;
