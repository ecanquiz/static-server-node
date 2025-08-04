import {describe, it, expect} from 'vitest'
import config from '../index';

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