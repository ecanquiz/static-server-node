import { describe, it, expect, vi } from 'vitest'; // beforeAll
import config from '../index';

/*beforeAll(() => {
  vi.stubEnv('HOST', 'http://test-host');
  vi.stubEnv('PORT', '1234');
  vi.stubEnv('API_ALLOWED_ORIGINS', '["http://test-origin"]');
  vi.stubEnv('API_SHARED_TOKENS', '{"test": "token"}');
});*/

describe('Configuration module', () => {
  describe('host configuration', () => {
    it('should use default host when not set', () => {
      vi.stubEnv('HOST', undefined);
      expect(config.host).toBe('http://localhost');
    });

    it('should use environment variable when set', () => {
      vi.stubEnv('HOST', 'http://myserver');
      expect(config.host).toBe('http://myserver');
    });

    it('should throw error for invalid URL format', () => {
      vi.stubEnv('HOST', 'not-a-valid-url');
      expect(() => config.host).toThrowError('Invalid HOST format. Expected valid URL');
    });
  });

  describe('port configuration', () => {
    it('should use default port when not set', () => {
      vi.stubEnv('PORT', undefined);
      expect(config.port).toBe(9000);
    });

    it('should parse environment variable correctly', () => {
      vi.stubEnv('PORT', '8080');
      expect(config.port).toBe(8080);
    });

    it('should throw error for non-numeric port', () => {
      vi.stubEnv('PORT', 'not-a-number');
      expect(() => config.port).toThrowError('Invalid PORT format. Expected number');
    });
  });

  describe('apiAllowedOrigins configuration', () => {
    it('should throw error when not set', () => {
      vi.stubEnv('API_ALLOWED_ORIGINS', undefined);
      expect(() => config.apiAllowedOrigins).toThrowError('Invalid API_ALLOWED_ORIGINS format. Expected JSON array');
    });

    it('should parse valid JSON array', () => {
      vi.stubEnv('API_ALLOWED_ORIGINS', '["http://localhost:3000", "https://example.com"]');
      expect(config.apiAllowedOrigins).toEqual([
        'http://localhost:3000',
        'https://example.com'
      ]);
    });
  });

  describe('apiSharedTokens configuration', () => {
    it('should throw error for non-object JSON', () => {
      vi.stubEnv('API_SHARED_TOKENS', '["array", "not", "object"]');
      expect(() => config.apiSharedTokens).toThrowError(
        'Invalid API_SHARED_TOKENS format. Expected JSON object'
      );
    });
  });
});