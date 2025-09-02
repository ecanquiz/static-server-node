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
  return base64
    .replace(/^data:\w+\/\w+;base64,/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const rebuildBase64 = function(compressed: string, mimeType = 'image/jpeg'): string {
  if (typeof compressed !== 'string') compressed = '';
  
  const base64 = compressed
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  // Padding calculation (múltiplo de 4)
  const padLength = (4 - (base64.length % 4)) % 4;
  const paddedBase64 = base64 + '='.repeat(padLength);

  return `data:${mimeType};base64,${paddedBase64}`;
}