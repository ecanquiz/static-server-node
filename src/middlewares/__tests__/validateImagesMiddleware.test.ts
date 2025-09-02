import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import validateImagesMiddleware, { validateImagesInput } from '../validateImagesMiddleware';

describe('validateImagesMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let consoleErrorSpy: any;

  beforeEach(() => {
    mockRequest = {
      body: {
        images: [
          'base64string1', // Simula strings base64
          'base64string2'
        ]
      }
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    mockNext = vi.fn();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic validation', () => {
    it('should reject requests without images array', () => {
      mockRequest = { body: {} };

      validateImagesMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Images array is required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject non-array images field', () => {
      mockRequest.body = { images: 'not-an-array' };

      validateImagesMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Images must be an array'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should accept valid images array', () => {
      validateImagesMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle unexpected errors with 500', () => {
      validateImagesMiddleware(
        { body: null } as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });
});

describe('validateImagesInput', () => {
  it('should pass with valid images array', () => {
    const req = { 
      body: {
        images: ['base64string1', 'base64string2']
      } 
    };
    expect(() => validateImagesInput(req as Request)).not.toThrow();
  });

  it('should throw on missing images', () => {
    const req = { body: {} };
    expect(() => validateImagesInput(req as Request))
      .toThrow('MISSING_IMAGES_ARRAY');
  });

  it('should throw on non-array images', () => {
    const req = { body: { images: 'not-an-array' } };
    expect(() => validateImagesInput(req as Request))
      .toThrow('INVALID_IMAGES_FORMAT');
  });

  it('should throw on too many images', () => {
    const req = { 
      body: { 
        images: Array(11).fill('base64string') 
      } 
    };
    expect(() => validateImagesInput(req as Request))
      .toThrow('TOO_MANY_IMAGES');
  });

  it('should throw on non-string image', () => {
    const req = { 
      body: { 
        images: [123] // Número en lugar de string
      } 
    };
    expect(() => validateImagesInput(req as Request))
      .toThrow('INVALID_IMAGE_FORMAT');
  });

  it('should throw on oversized image', () => {
    // Creamos un string base64 muy grande (>10MB)
    const hugeBase64 = 'A'.repeat(15 * 1024 * 1024 * 4 / 3); // ~15MB
    const req = { 
      body: { 
        images: [hugeBase64]
      } 
    };
    expect(() => validateImagesInput(req as Request))
      .toThrow('FILE_TOO_LARGE');
  });
});