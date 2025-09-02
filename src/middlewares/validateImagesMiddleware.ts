import { Request, Response, NextFunction } from 'express';
import config from '@config/index';

interface ErrorResponse {
  error: string;
  details?: string;
}

const { imagesValidation } = config

class ValidationError extends Error {
  details?: string;
  
  constructor(code: string, details?: string) {
    super(code);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export function validateImagesInput(req: Request): void {
  if (!req.body.images) {
    throw new ValidationError('MISSING_IMAGES_ARRAY');
  }
  
  if (!Array.isArray(req.body.images)) {
    throw new ValidationError('INVALID_IMAGES_FORMAT');
  }

  if (req.body.images.length > imagesValidation.MAX_IMAGES) {
    throw new ValidationError('TOO_MANY_IMAGES');
  }

  req.body.images.forEach((image: string, index: number) => {
    if (typeof image !== 'string') {
      throw new ValidationError('INVALID_IMAGE_FORMAT', `Image at position ${index} must be a string`);
    }

    const sizeInBytes = Math.ceil(image.length * 3 / 4);
    if (sizeInBytes > imagesValidation.MAX_SIZE_BYTES) {
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
          return res.status(400).json({ ...response, error: `Maximum ${imagesValidation.MAX_IMAGES} images allowed` });
        case 'INVALID_FILE_TYPE':
          return res.status(400).json({ ...response, error: 'Unsupported file type' });
        case 'FILE_TOO_LARGE':
          return res.status(400).json({ ...response, error: `File exceeds ${imagesValidation.MAX_SIZE_MB}MB limit` });
        default:
          return res.status(400).json({ ...response, error: 'Invalid image data' });
      }
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}
