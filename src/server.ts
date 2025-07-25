import express from 'express';
import path from 'path';
import cors from 'cors';
import { apiAllowedOrigins } from './config';
import createSymlink from './utils/createSymlink'
import apiRoutes from './routes/apiRoutes'

const app = express();

const origins: string[] = JSON.parse(apiAllowedOrigins);
app.use(cors({
  origin: origins,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Allow CORS for all origins (development only!)
/*app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
});*/

const imagesDir = path.join(__dirname, '../public/storage/images/articles');
const storageDir = path.join(__dirname, '../storage');
const publicStorageLink = path.join(__dirname, '../public/storage');

createSymlink( storageDir, publicStorageLink );

app.use('/images', express.static(imagesDir));
app.use('/storage', express.static(publicStorageLink));
app.use('/images', (req, res) => {
  res.status(404).send('Sorry, the image you are looking for does not exist.');
});
app.use('/storage', (req, res) => {
  res.status(404).send('Sorry, the requested file in storage does not exist..');
});

app.get('/', (req, res) => {
  res.send(`
    <h1>Static server with Node.js and Express</h1>
    <p>To access images, visit: <a href="/images">/images</a></p>
    <p>To access storage files, visit: <a href="/storage">/storage</a></p>
  `);
});

app.use(apiRoutes);

export default app;
