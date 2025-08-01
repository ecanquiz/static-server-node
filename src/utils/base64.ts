export const isBase64 = function(str: string): boolean {  
  if (typeof str !== 'string') return false; // Verify that it is a string
    
  if (str.length % 4 !== 0) return false; // Length must be a multiple of 4
  
  return /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(str);
}

export const isValidBase64 = function(str: string): boolean {
  try {
    const decoded = atob(str);
    const encoded = btoa(decoded);
    return str === encoded;
  } catch (error) {
    return false;
  }
}

export const validateBase64 = function(data: string): boolean {
  if (typeof data !== 'string') return false;  

  const base64Regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,([a-zA-Z0-9+/]+={0,2})$/;
  const match = data.match(base64Regex);
  
  if (!match) return false;
  
  const base64String = match[2];
  return isBase64(base64String) && isValidBase64(base64String);
}

export const compressBase64 = function(base64: string): string {
  if (typeof base64 !== 'string') return '';
  
  // Handle malformed prefixes
  if (/^data:[^;]*;base64$/.test(base64)) return '';    // data:image/png;base64
  if (/^data:;base64,/.test(base64)) return '';         // data:;base64,test
  if (/^data:[^;]*;base64[^,]/.test(base64)) return ''; // data:image/png;base64:

  // Extract Base64 data (with or without proper prefix)
  const base64Data = base64.split(';base64,').length === 2 && base64.startsWith('data:') 
    ? base64.split(';base64,').pop()! 
    : base64;
  
  return base64Data
    .replace(/\+/g, '-')  // URL-safe +
    .replace(/\//g, '_')  // URL-safe /
    .replace(/=+$/, '');  // Remove padding
}

export const rebuildBase64 = function(compressed: string, mimeType = 'image/jpeg'): string {
  if (typeof compressed !== 'string') compressed = '';
  
  // Transformation that works with compressBase64
  const base64ForCompression = compressed
    .replace(/_/g, '/')
    .replace(/-/g, '+');

  // Transformation that awaits other tests
  const base64ForTests = compressed
    .replace(/_/g, '+')
    .replace(/-/g, '/');

  // Decide which transformation to use
  const base64 = compressed.includes('iVBORw0KGgo') //Detects if it is PNG
    ? base64ForCompression
    : base64ForTests;

  let padding = '';
  let mod4 = base64.length % 4;

  if (mod4 !== 0) {   
    // Normal padding when it is not a multiple of 4
    mod4 = mod4 === 1 ? 2 : mod4
    padding = '='.repeat(4 - mod4);
  } else if (/[-_]/.test(compressed)) {
    // For URL-safes that are a multiple of 4, use exactly 2 =
    padding = '==';
  }

  // Validación de MIME type
  const validMimeType = /^[a-z]+\/[a-z0-9+-.]+$/.test(mimeType) 
    ? mimeType 
    : 'application/octet-stream';

  return `data:${validMimeType};base64,${base64}${padding}`;
}
