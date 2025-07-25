import express, { Router } from "express";
import validateSharedToken from "../middlewares/validateSharedTokenMiddleware";
import validateImages from "../middlewares/validateImagesMiddleware";
import { publicFile } from "../controllers/publicFileController"
import { processImages } from "../controllers/processImagesController"

const router = Router()

// Serving static files from 'public/images'
router.get('/api/public-file/:articleId/:filename', publicFile);

router.post(
  '/api/articles/:articleId/process-images',
  express.json({ limit: '50mb' }), // express.urlencoded({ limit: '50mb', extended: true }) For forms
  validateSharedToken,
  validateImages,
  processImages,
);

export default router;
