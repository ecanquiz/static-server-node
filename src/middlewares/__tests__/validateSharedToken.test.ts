import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import validateSharedTokenMiddleware from '../validateSharedTokenMiddleware';
import config from '../../config/index';

vi.mock('../../config/index', () => ({
  default: {
    apiSharedTokens: {
      'client-web': 'token-web-123',
      'client-mobile': 'token-mobile-456'
    } as Record<string, string>,
    // Add other necessary config properties
    host: 'http://localhost' as string,
    port: 9000 as number,
    // ... 
  }
}));
  
describe('validateSharedTokenMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  // @ts-ignore
  let consoleErrorSpy: vi.SpyInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn()
    };
    mockNext = vi.fn();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be a function', () => {
    expect(typeof validateSharedTokenMiddleware).toBe('function');
  });


  describe('Client validation', () => {
    it('should reject requests without x-client-name header', () => {
      mockRequest.headers = {}; // No x-client-name
    
      validateSharedTokenMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Client identifier missing',
        details: 'Include x-client-name header'
      });
      expect(mockNext).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should reject unknown clients', () => {
      mockRequest.headers = {
        'x-client-name': 'unknown-client'
      };

      validateSharedTokenMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unknown client'
      });
    });
  });

  describe('Token validation', () => {
    beforeEach(() => {
      // Common configuration for token testing
      mockRequest.headers = {
        'x-client-name': 'client-web'
      };
    });

    it('should reject requests without Authorization header', () => {
      validateSharedTokenMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
    
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Authorization header missing'
      });
    });

    it('should reject malformed Authorization header', () => {
      mockRequest.headers = {
        ...mockRequest.headers,
        'authorization': 'InvalidFormat'
      };

      validateSharedTokenMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid authorization format',
        details: 'Expected: Bearer <token>'
      });
    });

    it('should reject invalid tokens', () => {
      mockRequest.headers = {
        ...mockRequest.headers,
        'authorization': 'Bearer wrong-token'
      };

      validateSharedTokenMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid token for this client'
      });
    });

    it('should call next() with valid credentials', () => {
      mockRequest.headers = {
        'x-client-name': 'client-web',
        'authorization': 'Bearer token-web-123'
      };

      validateSharedTokenMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
   
    it('should handle unexpected errors', async () => {
      mockRequest.headers = {
        'x-client-name': 'client-web',
        'authorization': 'Bearer token-web-123'
      };

      // Temporary mock of console.error to catch the error
      const originalConsoleError = console.error;
      const consoleErrorMock = vi.fn();
      console.error = consoleErrorMock;

      // We keep the original implementation
      const originalMiddleware = validateSharedTokenMiddleware;

      // We directly mock the config dependency
      vi.spyOn(await import('../../config/index'), 'default', 'get').mockReturnValue({
        apiSharedTokens: null as any, // This will force an error
        host: 'http://localhost',
        port: 9000
      } as typeof config);

      originalMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(consoleErrorMock).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
         error: 'Internal server error'
      });

      // We restore the original console.error
      console.error = originalConsoleError;
    });
    
  });
});
  