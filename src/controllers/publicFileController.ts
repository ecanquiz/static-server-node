import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import getMimeType from "../utils/getMimeType";

const imagesDir = path.join(__dirname, '../../public/storage/images/articles');

export const publicFile = async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
