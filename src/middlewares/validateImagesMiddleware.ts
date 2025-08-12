import { Request, Response, NextFunction } from 'express';


interface ErrorResponse {
  error: string;
  details?: string;
}

/*export function validateImagesInput(req: Request): void | never {
  if (!req.body.images) {
    throw new Error('MISSING_IMAGES_ARRAY');
  }
  
  if (!Array.isArray(req.body.images)) {
    throw new Error('INVALID_IMAGES_FORMAT');
  }
}*/

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

  // Validación de cada imagen
  req.body.images.forEach((image: any, index: number) => {
    if (!image || typeof image !== 'object') {
      throw new ValidationError('INVALID_IMAGE_FORMAT', `Image at position ${index} is invalid`);
    }

    if (!VALIDATION_CONFIG.ALLOWED_TYPES.includes(image.mimetype)) {
      throw new ValidationError('INVALID_FILE_TYPE', `Unsupported type: ${image.mimetype}`);
    }

    if (image.size > VALIDATION_CONFIG.MAX_SIZE_MB * 1024 * 1024) {
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


/*
export default function (
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
): Response<ErrorResponse> | void {
  try {
    validateImagesInput(req); // Validación separada
    return next();
  } catch (error: any) {
    console.error('Images validation error:', error);

    if (error.message === 'MISSING_IMAGES_ARRAY') {
      return res.status(400).json({ error: 'Images array is required' });
    }

    if (error.message === 'INVALID_IMAGES_FORMAT') {
      return res.status(400).json({ error: 'Images must be an array' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}*/
