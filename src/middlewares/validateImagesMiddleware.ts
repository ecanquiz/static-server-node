import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  error: string;
  details?: string;
}

const VALIDATION_CONFIG = {
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  MAX_SIZE_MB: 5,
  MAX_IMAGES: 10
};

class ValidationError extends Error {
  details?: string;
  
  constructor(code: string, details?: string) {
    super(code);
    this.name = 'ValidationError';
    this.details = details;
  }
}

// Función para detectar tipo de imagen desde buffer (si es necesario después)
function detectImageTypeFromBase64(base64String: string): string {
  // Los primeros caracteres de base64 pueden indicar el tipo
  const signature = base64String.substring(0, 20);
  
  if (signature.startsWith('/9j') || signature.startsWith('/9J')) {
    return 'image/jpeg';
  }
  if (signature.startsWith('iVBORw')) {
    return 'image/png';
  }
  if (signature.startsWith('R0lGOD')) {
    return 'image/gif';
  }
  if (signature.startsWith('JVBER')) {
    return 'application/pdf';
  }
  
  return 'unknown';
}

export function validateImagesInput(req: Request): void {
  // Validación básica
  if (!req.body.images) {
    throw new ValidationError('MISSING_IMAGES_ARRAY');
  }
  
  if (!Array.isArray(req.body.images)) {
    throw new ValidationError('INVALID_IMAGES_FORMAT');
  }

  // Validación de cantidad
  if (req.body.images.length > VALIDATION_CONFIG.MAX_IMAGES) {
    throw new ValidationError('TOO_MANY_IMAGES');
  }

  // Validación de cada imagen (base64 puro)
  req.body.images.forEach((image: string, index: number) => {
    if (typeof image !== 'string') {
      throw new ValidationError('INVALID_IMAGE_FORMAT', `Image at position ${index} must be a string`);
    }

    // Validar tamaño aproximado (solo si pasa la validación base64)
    /*const sizeInBytes = Math.ceil(image.length * 3 / 4);
    if (sizeInBytes > VALIDATION_CONFIG.MAX_SIZE_BYTES) {
      throw new ValidationError('FILE_TOO_LARGE', `File at position ${index} exceeds size limit`);
    }*/

    const sizeInBytes = Math.ceil(image.length * 3 / 4);
    const maxSize = 10 * 1024 * 1024; // 10MB temporal - ajústalo luego
    if (sizeInBytes > maxSize) {
      throw new ValidationError('FILE_TOO_LARGE', `File at position ${index} exceeds size limit`);
    }
  });
}

export default function validateImagesMiddleware(
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
): Response<ErrorResponse> | void {
  try {
    validateImagesInput(req);
    return next();
  } catch (error: any) {
    console.error('Images validation error:', error);

    if (error instanceof ValidationError) {
      const response: ErrorResponse = { error: error.message };
      if (error.details) response.details = error.details;
      
      switch (error.message) {
        case 'MISSING_IMAGES_ARRAY':
          return res.status(400).json({ ...response, error: 'Images array is required' });
        case 'INVALID_IMAGES_FORMAT':
          return res.status(400).json({ ...response, error: 'Images must be an array' });
        case 'TOO_MANY_IMAGES':
          return res.status(400).json({ ...response, error: `Maximum ${VALIDATION_CONFIG.MAX_IMAGES} images allowed` });
        case 'INVALID_FILE_TYPE':
          return res.status(400).json({ ...response, error: 'Unsupported file type' });
        case 'FILE_TOO_LARGE':
          return res.status(400).json({ ...response, error: `File exceeds ${VALIDATION_CONFIG.MAX_SIZE_MB}MB limit` });
        default:
          return res.status(400).json({ ...response, error: 'Invalid image data' });
      }
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}

