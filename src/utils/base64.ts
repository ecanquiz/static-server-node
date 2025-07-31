/**
   * Important: It's crucial to note that these functions can't guarantee 100% that a string is Base64, but they do provide robust verification. In some cases, malformed strings may pass character validation but fail decoding.
   * Alternative (Node.js): If you're working with Node.js, you can use the Buffer module to verify the string.
   * 
   * // Node.js
   * function isBase64Node(str) {
   *   try {
   *     const buffer = Buffer.from(str, 'base64');
   *     return str === buffer.toString('base64');
   *   } catch (error) {
   *     return false;
   *   }
   * }
   */

/*export const isBase64 = function(str: string) {
  const regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return regex.test(str);
}*/

export const isBase64 = function(str: string) {
  // Verify that it is a string
  if (typeof str !== 'string') return false;
  
  // Length must be a multiple of 4
  if (str.length % 4 !== 0) return false;
  
  // Improved Regex
  return /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(str);
}

export const isValidBase64 = function(str: string) {
  try {
    const decoded = atob(str);
    const encoded = btoa(decoded);
    return str === encoded;
  } catch (error) {
    return false;
  }
}

/*export const isValidBase64 = function(str: string) {
  if (typeof str !== 'string') return false;
  
  try {
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch (e) {
    return false;
  }
}*/

/*export const validateBase64 = function(data: string) {
  const base64Regex = /^data:image\/[a-zA-Z]+;base64,(.+)$/;
  const match = data.match(base64Regex);
  if (match) {
    const base64String = match[1];
    return isBase64(base64String) && isValidBase64(base64String);
  }
  return false;
}
*/


export const validateBase64 = function(data: string) {
  if (typeof data !== 'string') return false;
  
  // Regex más estricto para tipos MIME de imagen
  const base64Regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,([a-zA-Z0-9+/]+={0,2})$/;
  const match = data.match(base64Regex);
  
  if (!match) return false;
  
  const base64String = match[2];
  return isBase64(base64String) && isValidBase64(base64String);
}

/**
 * Base64 compression (lossless of quality)
 * @param {string} base64 - Base64 string with prefix (eg: "data:image/png;base64,iVBOR...")
 * @returns {string} Base64 compressed (no metadata and URL-safe)
 */
/*export const compressBase64 = function(base64: string): string {
  if (typeof base64 !== 'string') return '';
  
  const parts = base64.split(';base64,'); // Remove the prefix
  if (parts.length < 2) return base64; // It is not a base64 with a prefix
  
  return parts[1]
    .replace(/\+/g, '-') // URL-safe: '+' -> '-'
    .replace(/\//g, '_') // URL-safe: '/' -> '_'
    .replace(/=+$/, ''); // Remove padding '='
}*/

/*export const compressBase64 = function(base64: string): string {
  if (typeof base64 !== 'string') return '';
  
  // Verificar si tiene el formato data:...;base64,...
  const base64Part = base64.split(';base64,').pop() || '';
  
  return base64Part
    .replace(/\+/g, '-')  // Convert + to -
    .replace(/\//g, '_')  // Convert all / to _
    .replace(/=+$/, '');  // Remove padding
}*/


/*export const compressBase64 = function(base64: string): string {
  if (typeof base64 !== 'string') return '';
  
  // Extraer solo la parte base64 si el prefijo está bien formado
  const parts = base64.split(';base64,');
  if (parts.length !== 2 || !parts[0].startsWith('data:')) {
    return base64.includes(';base64,') ? '' : base64;
  }
  
  return parts[1]
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}*/

/*export const compressBase64 = function(base64: string): string {
  if (typeof base64 !== 'string') return '';
  
  // Verificar si tiene un prefijo base64 mal formado
  const hasMalformedPrefix = /^data:[^;]*;base64[^,]/.test(base64);
  if (hasMalformedPrefix) return '';

  // Extraer solo la parte base64 si el prefijo está bien formado
  const parts = base64.split(';base64,');
  if (parts.length !== 2 || !parts[0].startsWith('data:')) {
    return base64;
  }
  
  return parts[1]
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}*/

/*export const compressBase64 = function(base64: string): string {
  if (typeof base64 !== 'string') return '';
  
  // Caso 1: Prefijo sin coma (data:image/png;base64)
  if (/^data:[^;]*;base64$/.test(base64)) return '';
  
  // Caso 2: MIME type vacío (data:;base64,test)
  if (/^data:;base64,/.test(base64)) return '';
  
  // Verificar si tiene un prefijo base64 mal formado
  const hasMalformedPrefix = /^data:[^;]*;base64[^,]/.test(base64);
  if (hasMalformedPrefix) return '';

  // Extraer solo la parte base64 si el prefijo está bien formado
  const parts = base64.split(';base64,');
  if (parts.length !== 2 || !parts[0].startsWith('data:')) {
    return base64;
  }
  
  return parts[1]
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}*/

/**
 * Compresses a Base64 string by:
 * 1. Removing data URL prefix if properly formatted
 * 2. Converting to URL-safe Base64
 * 3. Removing padding characters
 * @param {string} base64 - Input string (with or without data URL prefix)
 * @returns {string} Compressed Base64 string
 */
/*export const compressBase64 = function(base64: string): string {
  if (typeof base64 !== 'string') return '';
  
  // Caso 1: Prefijo sin coma (data:image/png;base64)
  if (/^data:[^;]*;base64$/.test(base64)) return '';
  
  // Caso 2: MIME type vacío (data:;base64,test)
  if (/^data:;base64,/.test(base64)) return '';
  
  // Verificar si tiene un prefijo base64 mal formado
  const hasMalformedPrefix = /^data:[^;]*;base64[^,]/.test(base64);
  if (hasMalformedPrefix) return '';

  // Extraer solo la parte base64 si el prefijo está bien formado
  const parts = base64.split(';base64,');
  const base64Data = parts.length === 2 && parts[0].startsWith('data:') 
    ? parts[1] 
    : base64;
  
  return base64Data
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}*/

export const compressBase64 = function(base64: string): string {
  if (typeof base64 !== 'string') return '';
  
  // Handle malformed prefixes
  if (/^data:[^;]*;base64$/.test(base64)) return '';        // data:image/png;base64
  if (/^data:;base64,/.test(base64)) return '';             // data:;base64,test
  if (/^data:[^;]*;base64[^,]/.test(base64)) return '';     // data:image/png;base64:

  // Extract Base64 data (with or without proper prefix)
  const base64Data = base64.split(';base64,').length === 2 && base64.startsWith('data:') 
    ? base64.split(';base64,').pop()! 
    : base64;
  
  return base64Data
    .replace(/\+/g, '-')  // URL-safe +
    .replace(/\//g, '_')  // URL-safe /
    .replace(/=+$/, '');  // Remove padding
}

/*
export const rebuildBase64 = function(compressed: string, mimeType = 'image/jpeg') {
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

*/

/*export const rebuildBase64 = function(compressed: string, mimeType = 'image/jpeg'): string {
  if (typeof compressed !== 'string') compressed = '';
  
  // Revert URL-safe transformation
  const base64 = compressed
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  // Calculate padding (only if needed)
  let padding = '';
  if (base64.length % 4 !== 0) {
    const padLength = 4 - (base64.length % 4);
    padding = '='.repeat(padLength);
  }

  // Validate mimeType
  const validMimeType = /^[a-z]+\/[a-z0-9+-]+$/.test(mimeType) 
    ? mimeType 
    : 'application/octet-stream';

  return `data:${validMimeType};base64,${base64}${padding}`;
}*/


/*export const rebuildBase64 = function(compressed: string, mimeType = 'image/jpeg'): string {
  if (typeof compressed !== 'string') compressed = '';
  
  // Revert URL-safe transformations (orden confirmado)
  const base64 = compressed
    .replace(/_/g, '+')  // _ → +
    .replace(/-/g, '/'); // - → /

  // Calcular padding (máximo 2 caracteres)
  let padding = '';
  const mod4 = base64.length % 4;
  if (mod4 !== 0) {
    const padLength = 4 - mod4;
    padding = '='.repeat(padLength > 2 ? 2 : padLength);
  }

  // Validar MIME type
  const validMimeType = /^[a-z]+\/[a-z0-9+-]+$/.test(mimeType) 
    ? mimeType 
    : 'application/octet-stream';

  return `data:${validMimeType};base64,${base64}${padding}`;
}
*/

/*export const rebuildBase64 = function(compressed: string, mimeType = 'image/jpeg'): string {
  if (typeof compressed !== 'string') compressed = '';
  
  // Revert ALL URL-safe transformations (orden crítico)
  const base64 = compressed
    .replace(/_/g, '+')  // Primero _ → +
    .replace(/-/g, '/')  // Luego - → /
    .replace(/\./g, '=') // Puntos a = (casos especiales)
    .replace(/,/g, '='); // Comas a = (casos especiales)

  // Cálculo de padding preciso
  let padding = '';
  const mod4 = base64.length % 4;
  if (mod4 !== 0 || /[-_.,]/.test(compressed)) {
    const neededPadding = mod4 === 0 ? 2 : 4 - mod4;
    padding = '='.repeat(Math.min(neededPadding, 2)); // Máximo 2 =
  }

  // Validación estricta de MIME type
  const validMimeType = /^[a-z]+\/[a-z0-9+-.]+$/.test(mimeType) 
    ? mimeType 
    : 'application/octet-stream';

  return `data:${validMimeType};base64,${base64}${padding}`;
}*/

/*export const rebuildBase64 = function(compressed: string, mimeType = 'image/jpeg'): string {
  if (typeof compressed !== 'string') compressed = '';
  
  // Detección del tipo de encoding
  const isStandardBase64 = !/[-_]/.test(compressed);
  
  // Transformación inversa adaptativa
  let base64 = compressed;
  if (!isStandardBase64) {
    base64 = base64
      .replace(/-/g, '+')
      .replace(/_/g, '/');
  }

  // Cálculo de padding inteligente
  let padding = '';
  const mod4 = base64.length % 4;
  if (mod4 !== 0 || !isStandardBase64) {
    const padLength = mod4 === 0 ? 2 : 4 - mod4;
    padding = '='.repeat(Math.min(padLength, 2));
  }

  // Validación de MIME type robusta
  const validMimeType = /^[a-z]+\/[a-z0-9+-.]+$/.test(mimeType) 
    ? mimeType 
    : 'application/octet-stream';

  return `data:${validMimeType};base64,${base64}${padding}`;
}*/

/*export const rebuildBase64 = function(compressed: string, mimeType = 'image/jpeg'): string {
  if (typeof compressed !== 'string') compressed = '';
  
  // Revert ALL URL-safe transformations (orden crítico)
  const base64 = compressed
    .replace(/_/g, '+')  // Primero _ → +
    .replace(/-/g, '/')  // Luego - → /
    .replace(/\./g, '=') // Puntos a = (casos especiales)
    .replace(/,/g, '='); // Comas a = (casos especiales)

  // Cálculo de padding preciso
  let padding = '';
  const mod4 = base64.length % 4;
  if (mod4 !== 0 || /[-_.,]/.test(compressed)) {
    const neededPadding = mod4 === 0 ? 2 : 4 - mod4;
    padding = '='.repeat(Math.min(neededPadding, 2)); // Máximo 2 =
  }

  // Validación estricta de MIME type
  const validMimeType = /^[a-z]+\/[a-z0-9+-.]+$/.test(mimeType) 
    ? mimeType 
    : 'application/octet-stream';

  return `data:${validMimeType};base64,${base64}${padding}`;
}*/

export const rebuildBase64 = function(compressed: string, mimeType = 'image/jpeg'): string {
  if (typeof compressed !== 'string') compressed = '';
  
  // Transformación URL-safe inversa (ORDEN CORRECTO)
  const base64 = compressed
    .replace(/\-/g, '+')  // - → +
    .replace(/\_/g, '/'); // _ → /

  // Cálculo inteligente de padding
  let padding = '';
  const hasUrlSafeChars = /[-_]/.test(compressed);
  const mod4 = base64.length % 4;
  
  if (hasUrlSafeChars) {
    // Para strings URL-safe, usar padding completo (2 = si es múltiplo de 4)
    padding = mod4 === 0 ? '==' : '='.repeat(4 - mod4);
  } else if (mod4 !== 0) {
    // Para strings normales, solo añadir padding necesario
    padding = '='.repeat(4 - mod4);
  }

  // Validación de MIME type
  const validMimeType = /^[a-z]+\/[a-z0-9+-]+$/.test(mimeType) 
    ? mimeType 
    : 'application/octet-stream';

  return `data:${validMimeType};base64,${base64}${padding}`;
}