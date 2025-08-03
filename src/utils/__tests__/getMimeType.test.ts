import { describe, it, expect, expectTypeOf } from 'vitest';
import getMimeType from '../getMimeType';

describe('getMimeType', () => {
  describe('Known extensions', () => {
    const testCases = [
      { ext: '.jpg', expected: 'image/jpeg' },
      { ext: '.jpeg', expected: 'image/jpeg' },
      { ext: '.png', expected: 'image/png' },
      { ext: '.gif', expected: 'image/gif' },
      { ext: '.pdf', expected: 'application/pdf' }
    ];

    testCases.forEach(({ ext, expected }) => {
      it(`should return "${expected}" for ${ext}`, () => {
        expect(getMimeType(`filename${ext}`)).toBe(expected);
      });
    });
  });

  describe('Special cases', () => {
    it('should handle uppercase in extensions', () => {
      expect(getMimeType('documento.JPG')).toBe('image/jpeg');
      expect(getMimeType('archivo.PDF')).toBe('application/pdf');
    });

    it('should handle complex paths', () => {
      expect(getMimeType('C:\\Documentos\\file.pdf')).toBe('application/pdf');
      expect(getMimeType('/user/docs/report.pdf')).toBe('application/pdf');
      expect(getMimeType('/ruta/completa/a/imagen.png')).toBe('image/png');
    });

    it('should return octet-stream for unknown extensions', () => {
      expect(getMimeType('file.xyz')).toBe('application/octet-stream');
      expect(getMimeType('file.unknown')).toBe('application/octet-stream');
    });      

    it('should handle files without extension', () => {
      expect(getMimeType('file')).toBe('application/octet-stream');
    });

    it('should handle empty strings', () => {
      expect(getMimeType('')).toBe('application/octet-stream');
    });

    it('should handle non-string input', () => {
      // @ts-ignore - Testing invalid case on purpose
      expect(getMimeType(123)).toBe('application/octet-stream');
    });

    it('should maintain the correct type at compile time', () => {
      const result = getMimeType('imagen.jpg');
      // @ts-expect-test
      expectTypeOf(result).toEqualTypeOf<string>();
    });
  });
});
