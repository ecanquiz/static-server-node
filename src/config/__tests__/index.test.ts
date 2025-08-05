import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import config from '../index';

describe('Configuration module', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => { // Reset process.env before each test
    
    process.env = { ...originalEnv };
    // Mock console.warn to not display logs in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    vi.restoreAllMocks();
  });

  afterEach(() => { // Clean up any mocks between tests
    vi.restoreAllMocks();
  });

  describe('host configuration', () => {
    it('should use default host when not set', () => {
      delete process.env.HOST;
      expect(config.host).toBe('http://localhost');
    });

    it('should use environment variable when set', () => {
      process.env.HOST = 'http://myserver';
      expect(config.host).toBe('http://myserver');
    });

    it('should throw error for invalid URL format', () => {
      process.env.HOST = 'not-a-valid-url';
      expect(() => config.host).toThrowError('Invalid HOST format. Expected valid URL');
    });
  });

  describe('port configuration', () => {
    it('should use default port when not set', () => {
      delete process.env.PORT;
      expect(config.port).toBe(9000);
    });

    it('should accept valid numeric strings', () => { 
      process.env.PORT = '8080';
      expect(config.port).toBe(8080);
    });

    const invalidCases = [
      'not-a-number', // Non-numeric port
      '123abc',       // Alphanumeric strings
      'abc123',       // Strings starting with letters
      '12 34',        // Spaces
      '12.34',        // Decimal points
      '0x12',         // Hexadecimal
      '',             // Empty string
      undefined,      // Undefined     
      null as any,    // Null
      '655356',       // Outside valid range
      '0'             // Outside valid range
    ];

    invalidCases.forEach((invalidCase) => {
      process.env.PORT = invalidCase;
      expect(() => config.port).toThrowError('Invalid PORT format. Expected number');
    });
  });

  describe('apiAllowedOrigins configuration', () => {
    it('should parse valid empty JSON array', () => {
      process.env.API_ALLOWED_ORIGINS = '[]';
      expect(config.apiAllowedOrigins).toEqual([]);
    });

    it('should parse valid JSON array', () => {
      process.env.API_ALLOWED_ORIGINS = '["http://localhost:3000", "https://example.com"]';
      expect(config.apiAllowedOrigins).toEqual(['http://localhost:3000', 'https://example.com']);
    });

    it('should throw error for invalid array JSON', () => {
      process.env.API_ALLOWED_ORIGINS = 'not-json';
      expect(() => config.apiAllowedOrigins).toThrowError(
        'Invalid API_ALLOWED_ORIGINS format. Expected JSON array'
      );
    });

    it('should throw error for non-array JSON', () => {
      process.env.API_ALLOWED_ORIGINS = '{"key": "value"}';
      expect(() => config.apiAllowedOrigins).toThrowError(
        'Invalid API_ALLOWED_ORIGINS format. Expected JSON array'
      );
    });

    it('should throw error when not set', () => {
      delete process.env.API_ALLOWED_ORIGINS;
      expect(() => config.apiAllowedOrigins)
        .toThrowError('Invalid API_ALLOWED_ORIGINS format. Expected JSON array');
    });
  });

  describe('apiSharedTokens configuration', () => {
    it('should throw error when not set', () => {
      delete process.env.API_SHARED_TOKENS;
      expect(() => config.apiSharedTokens)
        .toThrowError('Invalid API_SHARED_TOKENS format. Expected JSON object');
    });

    it('should parse valid JSON object', () => {
      process.env.API_SHARED_TOKENS = '{"client1": "token1", "client2": "token2"}';
      expect(config.apiSharedTokens).toEqual({client1: 'token1', client2: 'token2'});
    });

    it('should throw error for invalid JSON', () => {
      process.env.API_SHARED_TOKENS = 'not-json';
      expect(() => config.apiSharedTokens).toThrowError(
        'Invalid API_SHARED_TOKENS format. Expected JSON object'
      );
    });

    it('should throw error for non-object JSON', () => {
      process.env.API_SHARED_TOKENS = '["array", "not", "object"]';
      expect(() => config.apiSharedTokens).toThrowError(
        'Invalid API_SHARED_TOKENS format. Expected JSON object'
      );
    });
  });

  describe('apiSharedTokens validation', () => {
    const testCases = [{ 
      desc: 'should reject arrays',
      input: '["array", "not", "object"]',
      throws: true
    }, {
      desc: 'should reject non-string values',
      input: '{"valid": "token", "invalid": 123}',
      throws: true
    }, {
      desc: 'should accept valid token object',
      input: '{"client1": "token1", "client2": "token2"}',
      throws: false
    }];

    testCases.forEach(({desc, input, throws}) => {
      it(desc, () => {
        process.env.API_SHARED_TOKENS = input;
        if (throws) {
          expect(() => config.apiSharedTokens).toThrowError(
            'Invalid API_SHARED_TOKENS format. Expected JSON object'
          );
        } else {
          expect(() => config.apiSharedTokens).not.toThrow();
        }
      });
    });
  });

  describe('mainScreen configuration', () => {
    it('should contain basic HTML structure', () => {
      expect(config.mainScreen).toContain('<h1>Static server with Node.js and Express</h1>');
      expect(config.mainScreen).toContain('href="/images"');
      expect(config.mainScreen).toContain('href="/storage"');
    });
  });

  describe('Configuration Integration', () => {
    it('should warn when HOST not set', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      delete process.env.HOST;    
      const _ = config.host;

      expect(consoleSpy).toHaveBeenCalledWith('HOST not set, using default');
    });

    it('should throw error when required vars missing', () => {
      delete process.env.PORT;
      delete process.env.API_ALLOWED_ORIGINS;
      delete process.env.API_SHARED_TOKENS;

      expect(config.port).toBe(9000); // isn't error, set 9000 by default.
      expect(() => config.apiAllowedOrigins).toThrowError('Invalid API_ALLOWED_ORIGINS format. Expected JSON array');
      expect(() => config.apiSharedTokens).toThrowError('Invalid API_SHARED_TOKENS format. Expected JSON object');
    });
  });

  describe('Configuration', () => {
    it('should have default host', () => {
      expect(config.host).toBe('http://localhost');
    });

    it('should have default port', () => {
      expect(config.port).toBe(9000);
    });

    it('should parse allowed origins', () => {
      expect(Array.isArray(config.apiAllowedOrigins)).toBe(true);
    });

    it('should throw on invalid JSON', () => {
      process.env.API_ALLOWED_ORIGINS = 'invalid';
      expect(() => config.apiAllowedOrigins).toThrow();
    });
  });
});
