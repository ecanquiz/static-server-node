import express, { Router } from "express";
import path from 'path';
import config from '@config/index';
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

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         details:
 *           type: string
 *     ImagesResponse:
 *       type: object
 *       properties:
 *         imageNames:
 *           type: array
 *           items:
 *             type: string
 *   parameters:
 *     ArticleId:
 *       in: path
 *       name: articleId
 *       required: true
 *       schema:
 *         type: string
 *       description: ID del artículo
 *     Filename:
 *       in: path
 *       name: filename
 *       required: true
 *       schema:
 *         type: string
 *       description: Nombre del archivo
 */

// Static file serving - Documentación para archivos estáticos
/**
 * @swagger
 * /images/{filename}:
 *   get:
 *     summary: Obtener imagen estática
 *     description: Servir imágenes estáticas desde el directorio público
 *     tags: [Static Files]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del archivo de imagen
 *     responses:
 *       200:
 *         description: Imagen encontrada y servida
 *       404:
 *         description: Imagen no encontrada
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Sorry, the image you are looking for does not exist."
 */

/**
 * @swagger
 * /storage/{filepath}:
 *   get:
 *     summary: Obtener archivo de storage
 *     description: Servir archivos estáticos desde el directorio storage
 *     tags: [Static Files]
 *     parameters:
 *       - in: path
 *         name: filepath
 *         required: true
 *         schema:
 *           type: string
 *         description: Ruta del archivo en storage
 *     responses:
 *       200:
 *         description: Archivo encontrado y servido
 *       404:
 *         description: Archivo no encontrado
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Sorry, the requested file in storage does not exist."
 */
router.use('/images', express.static(imagesDir), (req, res) => {
  res.status(404).send('Sorry, the image you are looking for does not exist.');
});

router.use('/storage', express.static(publicStorageLink), (req, res) => {
  res.status(404).send('Sorry, the requested file in storage does not exist..');
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Página principal del API
 *     description: Muestra la página principal con información del servidor
 *     tags: [General]
 *     responses:
 *       200:
 *         description: HTML de la página principal
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get('/', (req, res) => { res.send(config.mainScreen); });

// Serving static files from 'public/images'
/**
 * @swagger
 * /api/public-file/{articleId}/{filename}:
 *   get:
 *     summary: Obtener archivo público
 *     description: Servir archivos específicos de artículos con caching
 *     tags: [Public Files]
 *     parameters:
 *       - $ref: '#/components/parameters/ArticleId'
 *       - $ref: '#/components/parameters/Filename'
 *     responses:
 *       200:
 *         description: Archivo servido exitosamente
 *         headers:
 *           Cache-Control:
 *             schema:
 *               type: string
 *             description: Caching headers
 *       404:
 *         description: Archivo no encontrado
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Archivo no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/api/public-file/:articleId/:filename', publicFile);

/**
 * @swagger
 * /api/articles/{articleId}/process-images:
 *   post:
 *     summary: Procesar imágenes para un artículo
 *     description: |
 *       Procesa imágenes en base64, las reconstruye y guarda en el sistema de archivos.
 *       Requiere autenticación por token.
 *     tags: [Articles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ArticleId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: base64
 *                 description: Array de imágenes en base64 (comprimidas)
 *                 example: ["SGVsbG8gV29ybGQ", "QW5vdGhlciBpbWFnZQ"]
 *     responses:
 *       200:
 *         description: Imágenes procesadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImagesResponse'
 *             example:
 *               imageNames: ["image1.jpg", "image2.png"]
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado - Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/api/articles/:articleId/process-images',
  express.json({ limit: '50mb' }), // express.urlencoded({ limit: '50mb', extended: true }) For forms
  validateSharedToken,
  validateImages,
  processImages,
);

export default router;
