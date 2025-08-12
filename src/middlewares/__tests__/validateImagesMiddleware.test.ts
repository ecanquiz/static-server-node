import { describe, it, expect, vi, beforeEach, afterEach, MockInstance } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import validateImagesMiddleware, { validateImagesInput } from '../validateImagesMiddleware';

describe('validateImagesMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let consoleErrorSpy: MockInstance;
  const oneMB = 1024 * 1024 // 1MB

  beforeEach(() => {
    mockRequest = {
      body: {
        images: [
          { mimetype: 'image/jpeg', size: oneMB },
          { mimetype: 'image/png',  size: oneMB }
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

  describe('validateImagesMiddleware', () => {
    it('should return 400 for missing images', () => {
      mockRequest.body = {};
    
      validateImagesMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Images array is required'
      });
    });

    it('should return 400 for missing images', () => {
      mockRequest.body.images = 'is-not-array';
    
      validateImagesMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Images must be an array'
      });
    });

    it('should handle unexpected errors 500', async () => {
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
    const req = { body: {
      images: [{
        mimetype: 'image/jpeg',
        size: 1024 * 1024 // 1MB
    }] } };
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
});

