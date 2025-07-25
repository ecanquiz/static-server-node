import type { Request, Response, NextFunction } from 'express';
import { apiSharedTokens } from '../config';

interface ErrorResponse {
  error: string;
  details?: string;
}

export default function(
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
): Response<ErrorResponse> | void  {
  try {
    const tokens: Record<string, string> = JSON.parse(apiSharedTokens);

    const client = req.headers['x-client-name'];
    if (!client) {
      return res.status(400).json({
        error: 'Client identifier missing',
        details: 'Include x-client-name header'
      });
    }

    if (typeof client !== 'string' || !(client in tokens)) {
      return res.status(401).json({ error: 'Unknown client' });
    }

    const auth = req.headers['authorization'];
    if (!auth) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }
    const [bearer, token] = auth.split(' ');
    if (bearer !== 'Bearer' || !token) {
      return res.status(401).json({
        error: 'Invalid authorization format',
        details: 'Expected: Bearer <token>' 
      });
    }

    if (token !== tokens[client]) {
      return res.status(401).json({ error: 'Invalid token for this client' });
    }

    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


/*
Custom Request Types

If your endpoints receive bodies with a specific structure, you can create interfaces:

interface ApiRequest<T = any> extends Request {
    body: T;
    // You can add other custom properties here if you use them.
}

// Example of use with a specific type for the body
interface MyPayload {
    payload: string;
    userId?: number;
}

const myHandler = (req: ApiRequest<MyPayload>, res: Response, next: NextFunction) => {
    // 'req.body' It is now typed as MyPayload
    console.log(req.body.payload); // string
    console.log(req.body.userId);  // number | undefined
};
 */