/*import { Request, Response, NextFunction } from 'express';

export default function (req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.body.images || !Array.isArray(req.body.images)) {
      return res.status(400).json({ error: 'Images array is required' });
    }
    next();
  } catch (error) {
    console.error('Images error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};*/

import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  error: string;
  details?: string;
}

export function validateImagesInput(req: Request): void | never {
  if (!req.body.images) {
    throw new Error('MISSING_IMAGES_ARRAY');
  }
  
  if (!Array.isArray(req.body.images)) {
    throw new Error('INVALID_IMAGES_FORMAT');
  }
}

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
}
