import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const HOST = process.env.HOST || 'http://localhost';
const PORT = process.env.PORT || 3000;
const imagesDir = path.join(__dirname, '../public/images');
const storageDir = path.join(__dirname, '../storage');
const publicStorageLink = path.join(__dirname, '../public/storage');

function createSymlink() {
  try {
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
      console.log('Se creó la carpeta storage');
    }
    if (!fs.existsSync(publicStorageLink)) {
      fs.symlinkSync(storageDir, publicStorageLink, 'junction');
      console.log('Enlace simbólico public/storage creado y apunta a storage');
    } else {
      // Verificar si es un enlace simbólico y apunta correctamente
      const linkStat = fs.lstatSync(publicStorageLink);
      if (!linkStat.isSymbolicLink()) {
        console.warn('public/storage existe pero no es un symlink.');
      }
    }
  } catch (err) {
    console.error('Error al crear enlace simbólico:', err);
  }
}

createSymlink();

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

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:\${PORT}`);
  console.log(`Serving static files in http://localhost:\${PORT}/images`);
  console.log(`Serving storage in http://localhost:\${PORT}/storage`);
});



