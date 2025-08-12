import { describe, it, expect, vi, beforeEach, afterEach, MockInstance } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import validateImagesMiddleware, { validateImagesInput } from '../validateImagesMiddleware';

describe('validateImagesMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    mockRequest = {
      body: {
        images: [
          {
            mimetype: 'image/jpeg',
            size: 1024 * 1024 // 1MB
          }
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
    it('should pass with valid images array', () => {
      expect(() => validateImagesInput(mockRequest as Request)).not.toThrow();
    });
  });

  describe('File type validation', () => {
    it('should reject invalid file types', () => {
      mockRequest.body.images[0].mimetype = 'application/exe';
      
      expect(() => validateImagesInput(mockRequest as Request))
        .toThrow('INVALID_FILE_TYPE');
    });
  });

  describe('File size validation', () => {
    it('should reject files over size limit', () => {
      mockRequest.body.images[0].size = 6 * 1024 * 1024; // 6MB
      
      expect(() => validateImagesInput(mockRequest as Request))
        .toThrow('FILE_TOO_LARGE');
    });
  });

  describe('Number of images validation', () => {
    it('should reject too many images', () => {
      mockRequest.body.images = Array(11).fill({
        mimetype: 'image/jpeg',
        size: 1024
      });
      
      expect(() => validateImagesInput(mockRequest as Request))
        .toThrow('TOO_MANY_IMAGES');
    });
  });

  describe('Middleware responses', () => {
    it('should return 400 for invalid file type', () => {
      mockRequest.body.images[0].mimetype = 'application/exe';
      
      validateImagesMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unsupported file type',
        details: expect.stringContaining('Unsupported type')
      });
    });
  });


});