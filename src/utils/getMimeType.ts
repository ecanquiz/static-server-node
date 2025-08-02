import path from 'path';

type ValidExtensions = '.jpg' | '.jpeg' | '.png' | '.gif' | '.pdf' | '.webp' | '.svg' | '.mp4' | '.mp3';
type MimeTypeMap = Record<ValidExtensions, string>;

// Function to determine the MIME type (optional)
/*export default function getMimeType(filePath: string): string {
  type MimeTypes =  '.jpg' | '.jpeg' | '.png' |  '.gif' | '.pdf';
  const extname: MimeTypes  = path.extname(filePath).toLowerCase() as MimeTypes;
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf'
  };
  return mimeTypes[extname] || 'application/octet-stream';
}*/



export default function getMimeType(filePath: string): string {
  if (typeof filePath !== 'string') return 'application/octet-stream';
  
  const mimeTypes: MimeTypeMap = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg'
  };

  const ext = path.extname(filePath).toLowerCase() as ValidExtensions;
  return mimeTypes[ext] || 'application/octet-stream';
}