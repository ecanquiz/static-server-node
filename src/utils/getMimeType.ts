import path from 'path';

// Function to determine the MIME type (optional)
export default function getMimeType(filePath: string): string {
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
}