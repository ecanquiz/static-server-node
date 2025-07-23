import { Router } from "express";
import path from 'path';
import fs from 'fs';
import getMimeType from "../utils/getMimeType";

const router = Router()
const imagesDir = path.join(__dirname, '../../public/storage/images/articles');

// Serving static files from 'public/images'
router.get('/api/public-file/:articleId/:filename', (req, res) => {
  const filePath = path.join(imagesDir, req.params.articleId.toString(), req.params.filename.toString());

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Archivo no encontrado');
  }

  // Send the file with the appropriate headers
  res.sendFile(filePath, {
    headers: {
      'Content-Type': getMimeType(filePath), //'image/jpeg',
      'Cache-Control': 'public, max-age=86400' // 1 day cache
    }
  });
});

export default router;
