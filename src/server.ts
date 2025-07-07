import express from 'express';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import dotenv from 'dotenv';
import multer from 'multer';
import { writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const HOST = process.env.HOST || 'http://localhost';
const PORT = process.env.PORT || 3000;

// Configure CORS (allow only your Vue.js domain)
app.use(cors({
  origin: 'http://localhost:5174',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Allow CORS for all origins (development only!)
/*app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
});*/

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
      // Check if it is a symbolic link and points correctly
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




// Serving static files from 'public/images'
app.get('/api/public-file/:filename', (req, res) => {
  const filePath = path.join(imagesDir, req.params.filename); 
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Archivo no encontrado');
  }
  res.sendFile(filePath);
});


/*// Path to serve files from a secure folder
app.get('/api/public-file/:path(*)', (req, res) => {
  const safePath = req.params.path;
  const baseDir = path.join(__dirname, 'storage/app/public'); // Adjust this route
  
  // Build the absolute path of the file
  const filePath = path.join(baseDir, safePath);

  // Verify that the file exists and is within the allowed directory
  if (!filePath.startsWith(baseDir)) {
    return res.status(403).send('Acceso denegado');
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Archivo no encontrado');
  }

  // Send the file with the appropriate headers
  res.sendFile(filePath, {
    headers: {
      'Content-Type': 'image/jpeg', //getMimeType(filePath),
      'Cache-Control': 'public, max-age=86400' // Cache de 1 día
    }
  });
});*/

// Function to determine the MIME type (optional)
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


/*
// Settings to increase the limit to 50MB (adjust as needed)
app.use(express.json({ limit: '50mb' })); // Para JSON
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Para formularios
*/

app.post('/api/process-images', express.json({ limit: '50mb' }), (req, res) => {
  console.log(req.body.images)
  /*const savedPaths: string[] = [];
  
  req.body.images.forEach((base64Str: string) => {
    const matches = base64Str.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) return;
    
    const [_, ext, data] = matches;
    const filename = `${uuidv4()}.${ext}`;
    const path = `/storage/images/${filename}`;
    
    writeFileSync(`.${path}`, Buffer.from(data, 'base64'));
    savedPaths.push(path);
  });

  res.json({ paths: savedPaths });*/
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:\${PORT}`);
  console.log(`Serving static files in http://localhost:\${PORT}/images`);
  console.log(`Serving storage in http://localhost:\${PORT}/storage`);
});



