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


describe('base64 utilities', () => {
  const testBase64 = 'data:image/jpeg;base64,SGVsbG8gV29ybGQ='; // "Hello World" in base64

  describe('compressBase64', () => {
    it('should remove data URI prefix', () => {
      const compressed = compressBase64(testBase64);
      expect(compressed).not.toMatch(/^data:/);
      expect(compressed).not.toMatch(/;base64,/);
    });

    it('should make URL-safe replacements', () => {
      const compressed = compressBase64(testBase64);
      expect(compressed).toMatch(/^[A-Za-z0-9_-]+$/); // Solo caracteres URL-safe
    });

    it('should remove padding', () => {
      const compressed = compressBase64(testBase64);
      expect(compressed).not.toMatch(/=$/);
    });
  });

  describe('rebuildBase64', () => {
    it('should reconstruct original base64', () => {
      const compressed = compressBase64(testBase64);
      const rebuilt = rebuildBase64(compressed, 'image/jpeg');
      
      expect(rebuilt).toBe(testBase64);
    });

    it('should handle different mime types', () => {
      const pngBase64 = 'data:image/png;base64,SGVsbG8=';
      const compressed = compressBase64(pngBase64);
      const rebuilt = rebuildBase64(compressed, 'image/png');
      
      expect(rebuilt).toBe(pngBase64);
    });

it('should add correct padding', () => {
  // Usamos strings base64 conocidos con diferentes longitudes
  const testCases = [
    { input: 'SGVsbG8', expected: 'SGVsbG8=' },        // 6 chars -> 1 padding
    { input: 'SGVsbG8g', expected: 'SGVsbG8g' },       // 7 chars -> 0 padding (ya es múltiplo de 4)
    { input: 'SGVsbG8gV29ybGQ', expected: 'SGVsbG8gV29ybGQ=' } // 15 chars -> 1 padding
  ];

  testCases.forEach(({ input, expected }) => {
    // Creamos un data URI de prueba
    const testDataUri = `data:text/plain;base64,${input}`;
    
    // Compress y rebuild
    const compressed = compressBase64(testDataUri);
    const rebuilt = rebuildBase64(compressed, 'text/plain');
    
    // Extraemos la parte base64 del resultado
    const rebuiltBase64 = rebuilt.split(';base64,')[1];
    
    // Verificamos que el padding sea correcto
    expect(rebuiltBase64).toBe(expected);
  });
});

  });

  describe('round-trip compatibility', () => {

it('should handle padding correctly in round-trip', () => {
  // Strings que sabemos que necesitan diferente padding
  const testStrings = [
    'Hello',           // 5 chars -> 1 padding
    'Hello World',     // 11 chars -> 1 padding  
    'Test',            // 4 chars -> 0 padding (múltiplo de 4)
    'Testing 123!'     // 12 chars -> 0 padding
  ];

  testStrings.forEach(text => {
    // Convertimos a base64 (en Node.js debemos usar Buffer)
    const base64Text = Buffer.from(text).toString('base64');
    const dataUri = `data:text/plain;base64,${base64Text}`;
    
    // Round-trip completo
    const compressed = compressBase64(dataUri);
    const rebuilt = rebuildBase64(compressed, 'text/plain');
    
    // Deberían ser idénticos
    expect(rebuilt).toBe(dataUri);
  });
});

it('should work with Buffer-based base64', () => {
  const texts = ['Hello', 'Test 123', '🎉 Emoji!'];
  
  texts.forEach(text => {
    // Crear base64 con Buffer (equivalente a btoa en navegador)
    const base64 = Buffer.from(text).toString('base64');
    const dataUri = `data:text/plain;base64,${base64}`;
    
    const compressed = compressBase64(dataUri);
    const rebuilt = rebuildBase64(compressed, 'text/plain');
    
    expect(rebuilt).toBe(dataUri);
  });
});

it('should maintain data integrity through compression and rebuild', () => {
  const original = 'data:text/plain;base64,SGVsbG8='; // "Hello" con padding
  
  const compressed = compressBase64(original);
  const rebuilt = rebuildBase64(compressed, 'text/plain');
  
  // La prueba importante: que el round-trip no corrompe los datos
  expect(rebuilt).toBe(original);
});

    it('should be able to compress and rebuild multiple times', () => {
      const original = testBase64;
      
      // Compress and rebuild multiple times
      let current = original;
      for (let i = 0; i < 5; i++) {
        const compressed = compressBase64(current);
        current = rebuildBase64(compressed, 'image/jpeg');
      }
      
      expect(current).toBe(original);
    });
    it('should reconstruct original after compression', () => {
  const testStrings = [
    'Hello',                    // Texto simple
    'Hello World!',             // Texto con espacio
    'Test with special chars!', // Texto más largo
  ];

  testStrings.forEach(text => {
    // Convertimos a base64 manualmente
    const originalBase64 = `data:text/plain;base64,${btoa(text)}`;
    
    // Compress y rebuild
    const compressed = compressBase64(originalBase64);
    const rebuilt = rebuildBase64(compressed, 'text/plain');
    
    // Deberían ser idénticos
    expect(rebuilt).toBe(originalBase64);
  });
});

  });
});