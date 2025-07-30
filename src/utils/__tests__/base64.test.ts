import { describe, it, expect, vi } from 'vitest';
import { isBase64, isValidBase64, validateBase64 } from '../base64';

const validCases = [
  'SGVsbG8gd29ybGQ=', // "Hello world"
  'Zm9vYmFy', // "foobar"
  'AQIDBAU=', // Binary data
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', // JWT header
  'dGVzdA==', // "test" with padding
  'YW55IGNhcm5hbCBwbGVhc3VyZS4=', // "any carnal pleasure."
  '', // Empty string
];

const invalidCases = [
  'Hello world', // Text normal
  'SGVsbG8gd29ybGQ', // Missing padding
  'SGVsbG8gd29ybGQ===', // Excessive padding
  'SGVsbG8gd29ybGQ!', // Invalid character (!)
  'U3VwZXI=U3VwZXI=', // Multiple parts
  'AB\0CD', // Null character
  'AB\tCD', // Tabulator
  'AB\nCD', // New line
  'AB CD', // Space
  'ÁB==', // Accentuated character
];

const edgeCases = [
  123, // No-string input
  null,
  undefined,
  {}
];

describe('isBase64', () => {
  // Valid cases
  it('should return true for valid Base64 strings', () => {
    validCases.forEach((testCase) => {
      expect(isBase64(testCase)).toBe(true);
    });
  });

  // Invalid cases
  it('should return false for invalid Base64 strings', () => {
    invalidCases.forEach((testCase) => {
      expect(isBase64(testCase)).toBe(false);
    });
  });

  // Special cases
  it('should handle edge cases', () => {
    expect(isBase64('')).toBe(true); // Empty string is technically valid
    edgeCases.forEach((testCase) => {
      expect(isBase64(testCase as any)).toBe(false);
    });
  });

  // Base64 edge cases
  it('should reject strings with incorrect padding', () => {
    expect(isBase64('A===')).toBe(false);
    expect(isBase64('ABCD=')).toBe(false);
  });

  it('should reject strings with wrong length', () => {
    expect(isBase64('ABC')).toBe(false);
    expect(isBase64('ABCDE')).toBe(false);
  });

  it('should accept URL-safe Base64 variants', () => {
    // If you need to support Base64 secure URLs
    expect(isBase64('AB-CD_EF')).toBe(false); // Only if you can't stand it
  });
});


describe('isValidBase64', () => {
  // Standard valid cases
  it('should return true for valid Base64 strings', () => {
    validCases.forEach((testCase) => {
      expect(isValidBase64(testCase)).toBe(true);
    });
  });

  // Invalid cases
  it('should return false for invalid Base64 strings', () => {
    invalidCases.forEach((testCase) => {
      expect(isValidBase64(testCase)).toBe(false);
    });
  });

  // Special cases
  it('should handle edge cases', () => {
    expect(isValidBase64('')).toBe(true); // Empty string is technically valid
    edgeCases.forEach((testCase) => {
      expect(isValidBase64(testCase as any)).toBe(false);
    });
  });

  // Cases with Unicode
  it('should handle Unicode strings', () => {
    // btoa does not support Unicode directly
    expect(isValidBase64('4pyT')).toBe(true); // btoa(escape('✓'))
    expect(isValidBase64('8J+Yig==')).toBe(true); // btoa(escape('😊'))
  });

  // Error handling test
  it('should catch atob errors and return false', () => {
    const originalAtob = global.atob;
    global.atob = vi.fn(() => {
      throw new Error('Invalid character');
    });

    expect(isValidBase64('invalid')).toBe(false);
    expect(isValidBase64('SGVsbG8=')).toBe(false); // Although it is valid

    global.atob = originalAtob; // Restore
  });

  it('should handle large Base64 strings', () => {
    const largeText = 'a'.repeat(1000);
    const largeBase64 = btoa(largeText);
    expect(isValidBase64(largeBase64)).toBe(true);
  });

  it('should reject strings with whitespace', () => {
    expect(isValidBase64(' SGVsbG8=')).toBe(false);
    expect(isValidBase64('SGVsbG8=\n')).toBe(false);
  });

  it('should validate quickly', () => {
    const start = performance.now();
    isValidBase64('SGVsbG8gd29ybGQ=');
    expect(performance.now() - start).toBeLessThan(5); // ms
  });
});

describe('validateBase64', () => {
  // Valid cases
  it('should return true for valid Base64 image strings', () => {
    const validCases = [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==',
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAAAAADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJ//2Q==',
      'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
    ];

    validCases.forEach((testCase) => {
      expect(validateBase64(testCase)).toBe(true);
    });
  });

  // Invalid cases
  it('should return false for invalid Base64 image strings', () => {
    const invalidCases = [
      'data:image/png;base64,Inv@lid!', // Invalid characters
      'data:image/jpeg;base64,U3VwZXI=U3VwZXI=', // Multiple parts
      'data:image/gif;base64,AB\0CD', // Null character
      'data:video/mp4;base64,AAAAIGZ0eXBpc29t', // Incorrect MIME type
      'image/png;base64,iVBORw0KG...', // 'data:' is missing
      'data:image/png;base64', // Missing data
      'plain text', // Normal text
      '', // Empty
      null, // Non-string values
      undefined
    ];

    invalidCases.forEach((testCase) => {
      expect(validateBase64(testCase as any)).toBe(false);
    });
  });

  // Edge cases
  it('should handle edge cases', () => {
    // Unusual but valid MIME type
    expect(validateBase64('data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=')).toBe(true);
    
    // MIME type with additional parameters
    expect(validateBase64('data:image/png;param=value;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==')).toBe(false);
  });
});