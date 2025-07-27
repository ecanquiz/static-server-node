import express, { Router } from "express";
import path from 'path';
import { mainScreen } from '@config/index';
import validateSharedToken from "@middlewares/validateSharedTokenMiddleware";
import validateImages from "@middlewares/validateImagesMiddleware";
import { publicFile } from "@controllers/publicFileController"
import { processImages } from "@controllers/processImagesController"
import createSymlink from '@utils/createSymlink'

const router = Router();
const imagesDir = path.join(__dirname, '../../public/storage/images/articles');
const storageDir = path.join(__dirname, '../../storage');
const publicStorageLink = path.join(__dirname, '../../public/storage');

createSymlink( storageDir, publicStorageLink );

router.use('/images', express.static(imagesDir), (req, res) => {
  res.status(404).send('Sorry, the image you are looking for does not exist.');
});

router.use('/storage', express.static(publicStorageLink), (req, res) => {
  res.status(404).send('Sorry, the requested file in storage does not exist..');
});

router.get('/', (req, res) => { res.send(mainScreen); });

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
