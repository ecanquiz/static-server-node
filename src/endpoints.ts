import express, { Router } from "express";
import { writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

const imageRouter = Router()

function rebuildBase64(compressed: string, mimeType = 'image/jpeg') {
  // Revert URL-safe transformation
  const base64 = compressed
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  // Add padding '=' if necessary (length multiple of 4)
  const padLength = 4 - (base64.length % 4);
  const paddedBase64 = base64 + '='.repeat(padLength % 4);

  // Rebuild the complete Base64
  const fullBase64 = `data:${mimeType};base64,${paddedBase64}`;

  return fullBase64;
}


imageRouter.post('/api/process-images', express.json({ limit: '50mb' }), (req, res) => {
  // console.log(req.body.images)
  const savedPaths: string[] = [];
  
  req.body.images.forEach((base64Str: string) => {
    const base64StrReBuilt=rebuildBase64(base64Str)

    const matches = base64StrReBuilt.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) return;
    
    const [_, ext, data] = matches;
    const filename = `${uuidv4()}.${ext}`;
    const path = `/storage/images/${filename}`;
    
    writeFileSync(`.${path}`, Buffer.from(data, 'base64'));
    savedPaths.push(path);
  });

  res.json({ paths: savedPaths });
});

export default imageRouter;