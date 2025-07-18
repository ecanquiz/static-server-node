import { Router } from "express";
import path from 'path';
import fs from 'fs';

const router = Router()
const imagesDir = path.join(__dirname, '../../public/storage/images/articles');

// Serving static files from 'public/images'
router.get('/api/public-file/:articleId/:filename', (req, res) => {
  const filePath = path.join(imagesDir, req.params.articleId.toString(), req.params.filename.toString());

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Archivo no encontrado');
  }
  res.sendFile(filePath);
});

export default router;


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