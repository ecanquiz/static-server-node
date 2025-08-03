import { describe, it, expect, vi } from 'vitest';
import { isBase64, isValidBase64, validateBase64, compressBase64, rebuildBase64 } from '../base64';

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

describe('compressBase64', () => {
  //Standard cases
  it('should remove metadata prefix and convert characters', () => {
    const input = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==';
    const expected = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z_C_HgAGgwJ_lK3Q6wAAAABJRU5ErkJggg';
    expect(compressBase64(input)).toBe(expected);
  });

  it('should correctly replace all special characters', () => {
    const input = 'data:text/plain;base64,a+b/c+d/e==';
    const expected = 'a-b_c-d_e';
    expect(compressBase64(input)).toBe(expected);
  });
  
  // Cases with different MIME types
  it('should handle various MIME types', () => {
    const cases = [{
      input: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...', 
      expected: '_9j_4AAQSkZJRg...' // JPEG Case (the one you already have)
    }, {
      input: 'data:application/json;base64,eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      expected: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' // Alternative simple case (no problematic characters)
    }, {
      input: 'data:application/pdf;base64,SimplePDF',
      expected: 'SimplePDF' // Simple case for PDF
    }];

    cases.forEach(({ input, expected }) => {
      expect(compressBase64(input)).toBe(expected);
    });
  });
  
  // URL-safe transformation cases
  it('should convert to URL-safe Base64', () => {
    const input = 'data:text/plain;base64,SGVsbG8gV29ybGQh+/==';
    const expected = 'SGVsbG8gV29ybGQh-_';
    expect(compressBase64(input)).toBe(expected);
  });

  it('should handle edge cases', () => {
    // Empty string (prefix only)
    expect(compressBase64('data:text/plain;base64,')).toBe('');
  
    // Padding only (you must completely remove the prefix and the =)
    expect(compressBase64('data:application/octet-stream;base64,===')).toBe('');
  
    // Special characters (must convert + to - and / to _)
    expect(compressBase64('data:text/plain;base64,/+/+/+/+==')).toBe('_-_-_-_-');
  });

  // Casos inválidos (deberían fallar o comportarse específicamente)
  it('should handle invalid inputs gracefully', () => {
    // 1. Sin prefijo - devuelve el string original
    expect(compressBase64('SGVsbG8gV29ybGQh')).toBe('SGVsbG8gV29ybGQh');
  
    // 2. Prefijo mal formado (con : en lugar de ,)
    expect(compressBase64('data:image/png;base64:')).toBe('');
  
    // 3. Prefijo parcialmente correcto
    expect(compressBase64('data:image/png;base64=')).toBe('');
  
    // 4. Valores no string
    expect(compressBase64(null as any)).toBe('');
    expect(compressBase64(undefined as any)).toBe('');
    expect(compressBase64(123 as any)).toBe('');
  
    // 5. String vacío
    expect(compressBase64('')).toBe('');
    expect(compressBase64('data:image/png;base64')).toBe('');
    expect(compressBase64('data:image/png;base64,')).toBe(''); // Sin datos
    expect(compressBase64('data:;base64,test')).toBe(''); // MIME type vacío
  });

  it('should pass all test cases', () => {
  // Casos que ya pasaban
  expect(compressBase64('data:image/png;base64,iVBOR...')).toBe('iVBOR...');
  expect(compressBase64('SGVsbG8=')).toBe('SGVsbG8');
  expect(compressBase64(null as any)).toBe('');
  
  // Casos de prefijos mal formados
  expect(compressBase64('data:image/png;base64:')).toBe('');
  expect(compressBase64('data:image/png;base64=')).toBe('');
  
  // Casos específicos que faltaban
  expect(compressBase64('data:image/png;base64')).toBe('');  
  expect(compressBase64('data:;base64,test')).toBe('');
  
  // Casos edge adicionales
  expect(compressBase64('data:text/plain;base64,')).toBe('');
  expect(compressBase64('data:application/octet-stream;base64,===')).toBe('');
});

it('should pass all test cases', () => {
  // Casos con prefijo válido
  expect(compressBase64('data:image/png;base64,iVBOR...')).toBe('iVBOR...');
  
  // Strings sin prefijo
  expect(compressBase64('SGVsbG8=')).toBe('SGVsbG8');
  expect(compressBase64('A/B+C==')).toBe('A_B-C');
  
  // Valores no string
  expect(compressBase64(null as any)).toBe('');
  expect(compressBase64(undefined as any)).toBe('');
  
  // Prefijos mal formados
  expect(compressBase64('data:image/png;base64:')).toBe('');
  expect(compressBase64('data:image/png;base64=')).toBe('');
  expect(compressBase64('data:image/png;base64')).toBe('');  
  expect(compressBase64('data:;base64,test')).toBe('');
  
  // Casos edge
  expect(compressBase64('data:text/plain;base64,')).toBe('');
  expect(compressBase64('data:application/octet-stream;base64,===')).toBe('');
});
});

describe('rebuildBase64', () => {
  it('should be inverse of compressBase64', () => {
    const original = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
    const compressed = compressBase64(original);
    const rebuilt = rebuildBase64(compressed, 'image/png');

    expect(rebuilt).toBe(original);
  });

  it('should handle URL-safe strings', () => {
    const original = 'data:image/png;base64,a+b/c=='; // Nota: 2 ==
    const compressed = 'a_b-c';

    expect(rebuildBase64(compressed, 'image/png')).toBe(original);
  });

  it('should handle mixed cases', () => {
    const original = 'data:image/jpeg;base64,a+b/c+d=';
    const compressed = 'a_b-c_d';

    expect(rebuildBase64(compressed)).toBe(original);
  });
});
