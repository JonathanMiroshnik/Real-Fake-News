import { Router } from 'express';
import { searchTwitter, getUserTwitterTweets } from '../controllers/twitterController.js';

const router = Router();

router.get('/search', searchTwitter);
router.get('/user/:username', getUserTwitterTweets);

export default router;

