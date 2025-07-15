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

export const isBase64 = function(str: string) {
  const regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return regex.test(str);
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

export const validateBase64 = function(data: string) {
  const base64Regex = /^data:image\/[a-zA-Z]+;base64,(.+)$/;
  const match = data.match(base64Regex);
  if (match) {
    const base64String = match[1];
    return isBase64(base64String) && isValidBase64(base64String);
  }
  return false;
}

  /**
 * Base64 compression (lossless of quality)
 * @param {string} base64 - Base64 string with prefix (eg: "data:image/png;base64,iVBOR...")
 * @returns {string} Base64 compressed (no metadata and URL-safe)
 */
export const compressBase64 = function(base64: string) {
  return base64
    .replace(/^data:\w+\/\w+;base64,/, '') // Remove the prefix
    .replace(/\+/g, '-')                   // URL-safe: '+' -> '-'
    .replace(/\//g, '_')                   // URL-safe: '/' -> '_'
    .replace(/=+$/, '');                   // Remove padding '='
}


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