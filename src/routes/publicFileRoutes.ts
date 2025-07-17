import { Router } from "express";
import path from 'path';
import fs from 'fs';

const imageRouterx = Router()
const imagesDir = path.join(__dirname, '../../public/storage/images/articles');


// Serving static files from 'public/images'
imageRouterx.get('/api/public-file/:articleId/:filename', (req, res) => {
  const filePath = path.join(imagesDir, req.params.articleId.toString(), req.params.filename.toString());

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Archivo no encontrado');
  }
  res.sendFile(filePath);
});

export default imageRouterx;
