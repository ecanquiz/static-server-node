import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { rebuildBase64 } from '@utils/base64';
import writeFilesToDisk from '@utils/writeFilesToDisk';

export const processImages = async (req: Request, res: Response) => {
  try {
    // console.log(req.body.images)
  const imageNames: string[] = [];
  const dir = `/storage/images/articles/${req.params.articleId}`;
  const imagesDir = path.join(__dirname, `../../${dir}`);

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
    throw new Error('The directory could not be created');
  }

  // write files to disk
  req.body.images.forEach((base64Str: string) => {
    const base64StrReBuilt = rebuildBase64(base64Str);
    writeFilesToDisk(base64StrReBuilt, dir, imageNames);
  });

  res.json({ imageNames });
    
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal server error' });
  }
};
