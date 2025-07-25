import { Request, Response, NextFunction } from 'express';

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
};