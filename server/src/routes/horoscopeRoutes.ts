import { Router } from 'express';
import { 
  getHoroscopes, 
  getHoroscopeBySign, 
  getAstrologicalData 
} from '../controllers/horoscopeController.js';

const router = Router();

router.get('/', getHoroscopes);
router.get('/astrological-data', getAstrologicalData);
router.get('/:sign', getHoroscopeBySign);

export default router;

