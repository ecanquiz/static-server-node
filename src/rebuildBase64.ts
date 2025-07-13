export default function rebuildBase64(compressed: string, mimeType = 'image/jpeg') {
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