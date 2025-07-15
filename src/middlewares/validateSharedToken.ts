
import { Request, Response, NextFunction } from 'express';

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
        const sharedToken = process.env.API_SHARED_TOKEN;

        if (!sharedToken) {
            throw new Error('Server misconfiguration');
        }
        
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing' });
        }
        
        const [bearer, token] = authHeader.split(' ');
        if (bearer !== 'Bearer' || !token) {
            return res.status(401).json({ error: 'Invalid authorization format' });
        }
        
        if (token !== sharedToken) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

/*
import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
    error: string;
    details?: string;
}

const validateSharedToken = (
    req: Request,
    res: Response<ErrorResponse>,
    next: NextFunction
): Response<ErrorResponse> | void => {
    const sharedToken = process.env.API_SHARED_TOKEN;
    
    if (!sharedToken) {
        console.error('API_SHARED_TOKEN no está configurado');
        return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header missing' });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            error: 'Invalid authorization format',
            details: 'Expected: Bearer <token>' 
        });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (token !== sharedToken) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    return next();
};

export default validateSharedToken;
*/