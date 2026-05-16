import { Router } from 'express';
import {
  getAdminArticles,
  getAdminArticlesCount,
  getAdminArticle,
  updateAdminArticle,
  deleteAdminArticle,
  setFeaturedArticle,
  uploadAdminImage,
  uploadMiddleware,
  getAdminTexts,
  addAdminText,
  generateAdminArticle,
  generateAdminRecipe,
  getAdminConfig,
  updateAdminConfig,
  getSchedulerJobs,
  getSchedulerJob,
  triggerSchedulerJob,
  pauseSchedulerJob,
  resumeSchedulerJob,
} from '../controllers/adminController.js';
import {
  getCronJobs,
  createCronJob,
  updateCronJob,
  deleteCronJob,
} from '../controllers/cronJobController.js';

const router = Router();

// Admin routes - password protected via query parameter
router.get('/articles', getAdminArticles);
router.get('/articles/count', getAdminArticlesCount);
router.get('/articles/:key', getAdminArticle);
router.put('/articles/:key', updateAdminArticle);
router.put('/articles/:key/featured', setFeaturedArticle);
router.delete('/articles/:key', deleteAdminArticle);
router.post('/images/upload', uploadMiddleware, uploadAdminImage);
router.get('/texts', getAdminTexts);
router.post('/texts', addAdminText);
router.post('/generate/article', generateAdminArticle);
router.post('/generate/recipe', generateAdminRecipe);
router.get('/config', getAdminConfig);
router.put('/config', updateAdminConfig);

// Scheduler management routes
router.get('/scheduler/jobs', getSchedulerJobs);
router.get('/scheduler/jobs/:jobName', getSchedulerJob);
router.post('/scheduler/run/:jobName', triggerSchedulerJob);
router.post('/scheduler/pause/:jobName', pauseSchedulerJob);
router.post('/scheduler/resume/:jobName', resumeSchedulerJob);

// Absolute Clock cron job CRUD routes
router.get('/cron-jobs', getCronJobs);
router.post('/cron-jobs', createCronJob);
router.put('/cron-jobs/:id', updateCronJob);
router.delete('/cron-jobs/:id', deleteCronJob);

export default router;
