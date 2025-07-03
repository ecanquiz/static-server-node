import express from 'express';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();



const app = express();
const HOST = process.env.HOST || 'http://localhost';
const PORT = process.env.PORT || 3000;


/*// Configura CORS (permite solo tu dominio Vue.js)
app.use(cors({
  origin: 'http://localhost:5174',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
*/

// Permitir CORS para todos los orígenes (¡solo desarrollo!)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
});

const imagesDir = path.join(__dirname, '../public/images');
const storageDir = path.join(__dirname, '../storage');
const publicStorageLink = path.join(__dirname, '../public/storage');
const upload = multer({ dest: 'uploads/' });

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

app.post('/api/upload', upload.single('file'), (req, res) => {
  res.send('Archivo subido exitosamente');
});

app.delete('/api/delete', (req, res) => {
  const filename = req.body.filename;
  // Logic for deleting the file
  res.send('Archivo eliminado exitosamente');
});




// Servir archivos estáticos desde /storage/images
app.get('/api/public-file/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'storage', 'images', req.params.filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Archivo no encontrado');
  }

  res.sendFile(filePath);
});


/*// Ruta para servir archivos desde una carpeta segura
app.get('/api/public-file/:path(*)', (req, res) => {
  const safePath = req.params.path;
  const baseDir = path.join(__dirname, 'storage/app/public'); // Ajusta esta ruta
  
  // Construye la ruta absoluta del archivo
  const filePath = path.join(baseDir, safePath);

  // Verifica que el archivo exista y esté dentro del directorio permitido
  if (!filePath.startsWith(baseDir)) {
    return res.status(403).send('Acceso denegado');
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Archivo no encontrado');
  }

  // Envía el archivo con los headers adecuados
  res.sendFile(filePath, {
    headers: {
      'Content-Type': 'image/jpeg', //getMimeType(filePath),
      'Cache-Control': 'public, max-age=86400' // Cache de 1 día
    }
  });
});*/

// Función para determinar el tipo MIME (opcional)
/*function getMimeType(filePath: any) {
  const extname = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf'
  };
  return mimeTypes[extname] || 'application/octet-stream';
}*/




app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:\${PORT}`);
  console.log(`Serving static files in http://localhost:\${PORT}/images`);
  console.log(`Serving storage in http://localhost:\${PORT}/storage`);
});



