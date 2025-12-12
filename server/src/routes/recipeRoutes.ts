import { Router } from 'express';
import { getRelevantRecipesController, getDailyRecipesController, getRecipeByKeyController } from '../controllers/recipeController.js';

const router = Router();

router.get('/relevant', getRelevantRecipesController);
router.get('/daily', getDailyRecipesController);
router.get('/:key', getRecipeByKeyController);

export default router;

