import { describe, it, expect, expectTypeOf } from 'vitest';
import getMimeType from '../getMimeType';

describe('getMimeType', () => {
  it('debe retornar "image/jpeg" para archivos .jpg', () => {
    expect(getMimeType('imagen.jpg')).toBe('image/jpeg');
  });

  it('debe retornar "image/jpeg" para archivos .jpeg', () => {
    expect(getMimeType('documento.jpeg')).toBe('image/jpeg');
  });

  it('debe retornar "image/png" para archivos .png', () => {
    expect(getMimeType('foto.png')).toBe('image/png');
  });

  it('debe retornar "image/gif" para archivos .gif', () => {
    expect(getMimeType('animacion.gif')).toBe('image/gif');
  });

  it('debe retornar "application/pdf" para archivos .pdf', () => {
    expect(getMimeType('documento.pdf')).toBe('application/pdf');
  });


  it('debe manejar mayúsculas en extensiones', () => {
    expect(getMimeType('documento.JPG')).toBe('image/jpeg');
    expect(getMimeType('archivo.PDF')).toBe('application/pdf');
  });

  it('debe retornar "application/octet-stream" para extensiones desconocidas', () => {
    expect(getMimeType('archivo.xyz')).toBe('application/octet-stream');
  });

  it('debe manejar paths complejos', () => {
    expect(getMimeType('/ruta/completa/a/imagen.png')).toBe('image/png');
    expect(getMimeType('C:\\Documentos\\file.pdf')).toBe('application/pdf');
  });

  it('debe manejar archivos sin extensión', () => {
    expect(getMimeType('archivo')).toBe('application/octet-stream');
  });

  it('debe manejar strings vacíos', () => {
    expect(getMimeType('')).toBe('application/octet-stream');
  });


  it('debe mantener el tipo correcto en tiempo de compilación', () => {
    const result = getMimeType('imagen.jpg');
    // @ts-expect-test
    expectTypeOf(result).toEqualTypeOf<string>();
  });
});


describe('getMimeType', () => {
  describe('Extensiones conocidas', () => {
    const testCases = [
      { ext: '.jpg', expected: 'image/jpeg' },
      { ext: '.jpeg', expected: 'image/jpeg' },
      { ext: '.png', expected: 'image/png' },
      { ext: '.gif', expected: 'image/gif' },
      { ext: '.pdf', expected: 'application/pdf' }
    ];

    testCases.forEach(({ ext, expected }) => {
      it(`debe retornar "${expected}" para ${ext}`, () => {
        expect(getMimeType(`archivo${ext}`)).toBe(expected);
      });
    });
  });

  describe('Casos especiales', () => {
    it('debe manejar paths complejos', () => {
      expect(getMimeType('/user/docs/report.pdf')).toBe('application/pdf');
    });

    it('debe retornar octet-stream para extensiones desconocidas', () => {
      expect(getMimeType('file.unknown')).toBe('application/octet-stream');
    });

    it('debe manejar entrada no string', () => {
      // @ts-ignore - Probando caso inválido a propósito
      expect(getMimeType(123)).toBe('application/octet-stream');
    });
  });
});
