import express, { Router } from "express";
import fs, { writeFileSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { rebuildBase64 } from '../utils/base64';
import validateSharedToken from "../middlewares/validateSharedToken";

const imageRouter = Router()

imageRouter.post(
    '/api/articles/:articleId/process-images',
    validateSharedToken,
    express.json({ limit: '50mb' }    
  ), (req, res) => {
  // console.log(req.body.images)
  const imageNames: string[] = [];
  const dir = `/storage/images/articles/${req.params.articleId}`;
  const imagesDir = path.join(__dirname, `../${dir}`);

  // Delete folder if it exists
  if (fs.existsSync(imagesDir)) {
    fs.chmodSync(imagesDir, 0o777); // Give full permissions first
    fs.rmSync(imagesDir, { recursive: true, force: true });
  }

  // Create folder with permissions 0777 (read/write for everyone)
  fs.mkdirSync(imagesDir, {
    recursive: true,
    mode: 0o777 // Full permissions (in development)
  });

  // Verify that it was created correctly
  if (!fs.existsSync(imagesDir)) {
    throw new Error('No se pudo crear el directorio');
  }
  
  req.body.images.forEach((base64Str: string) => {
    const base64StrReBuilt=rebuildBase64(base64Str)

    const matches = base64StrReBuilt.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) return;
    
    const [_, ext, data] = matches;
    const filename = `${uuidv4()}.${ext}`;

    const path = `${dir}/${filename}`;
    
    writeFileSync(`.${path}`, Buffer.from(data, 'base64'));

    imageNames.push(filename);

  });

  res.json({ imageNames });
});

export default imageRouter;

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


/*
Custom Request Types

If your endpoints receive bodies with a specific structure, you can create interfaces:

interface ApiRequest<T = any> extends Request {
    body: T;
    // Puedes añadir otras propiedades personalizadas aquí si las usas
}

// Ejemplo de uso con un tipo específico para el body
interface MyPayload {
    payload: string;
    userId?: number;
}

const myHandler = (req: ApiRequest<MyPayload>, res: Response, next: NextFunction) => {
    // req.body ahora está tipado como MyPayload
    console.log(req.body.payload); // string
    console.log(req.body.userId);  // number | undefined
};
 */