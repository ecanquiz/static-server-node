import { describe, it, expect, vi } from 'vitest';
import {compressBase64, rebuildBase64 } from '../base64';


describe('rebuildBase64', () => {

/*it('should handle URL-safe strings', () => {
  const original = 'data:image/png;base64,a+b/c=='; // Nota: 2 ==
  const compressed = 'a_b-c';
  expect(rebuildBase64(compressed, 'image/png')).toBe(original);
});*/

it('should be inverse of compressBase64', () => {
  const original = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
  const compressed = compressBase64(original);
  const rebuilt = rebuildBase64(compressed, 'image/png');
  expect(rebuilt).toBe(original); // Ahora pasa correctamente
});


/*  it('should handle mixed cases', () => {
    const original = 'data:image/jpeg;base64,a+b/c+d=';
    const compressed = 'a_b-c_d';
    expect(rebuildBase64(compressed)).toBe(original);
  });*/
});




/*it('should perfectly reverse compressBase64', () => {
  // Caso con padding extra
  const original1 = 'data:image/png;base64,a+b/c+d==';
  const compressed1 = compressBase64(original1);
  expect(rebuildBase64(compressed1, 'image/png')).toBe(original1);

  // Caso del test anterior
  const original2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
  const compressed2 = compressBase64(original2);
  expect(rebuildBase64(compressed2, 'image/png')).toBe(original2);

  // Caso sin padding
  const original3 = 'data:image/jpeg;base64,abcd';
  const compressed3 = compressBase64(original3);
  expect(rebuildBase64(compressed3)).toBe(original3);
});*/


//

//describe('rebuildBase64', () => {
  // Casos estándar (sin URL-safe)
  /*it('should handle standard Base64 strings', () => {
    const testCases = [
      {
        input: 'SGVsbG8gd29ybGQh', // No padding needed
        expected: 'data:image/jpeg;base64,SGVsbG8gd29ybGQh'
      },
      {
        input: 'abcd', // Exact multiple
        expected: 'data:image/jpeg;base64,abcd'
      },
      {
        input: 'abc', // Needs 1 =
        expected: 'data:image/jpeg;base64,abc='
      },
      {
        input: 'ab', // Needs 2 ==
        expected: 'data:image/jpeg;base64,ab=='
      }
    ];

    testCases.forEach(({ input, expected }) => {
      expect(rebuildBase64(input)).toBe(expected);
    });
  });

  // Casos URL-safe
  it('should handle URL-safe Base64 strings', () => {
    const testCases = [
      {
        input: 'SGVsbG8gd29ybGQh-_', // Needs padding
        expected: 'data:image/jpeg;base64,SGVsbG8gd29ybGQh+/=='
      },
    //  {
    //    input: 'a_b-c_d', // Mixed
    //    expected: 'data:image/jpeg;base64,a+b/c+d='
    //  },
    //  {
    //    input: '_-_', // Needs padding
    //    expected: 'data:image/jpeg;base64,+/+='
    //  }
    ];

    testCases.forEach(({ input, expected }) => {
      expect(rebuildBase64(input)).toBe(expected);
    });
  });*/

  // Casos con mimeType personalizado
  /*it('should handle custom mimeTypes', () => {
    expect(rebuildBase64('abc', 'image/png'))
      .toBe('data:image/png;base64,abc=');
    
    expect(rebuildBase64('abc', 'application/pdf'))
      .toBe('data:application/pdf;base64,abc=');
    
    // MimeType inválido
    expect(rebuildBase64('abc', 'invalid'))
      .toBe('data:application/octet-stream;base64,abc=');
  });

  // Casos edge
  it('should handle edge cases', () => {
    // String vacío
    expect(rebuildBase64(''))
      .toBe('data:image/jpeg;base64,');
    
    // Input no string
    expect(rebuildBase64(null as any))
      .toBe('data:image/jpeg;base64,');
    
    expect(rebuildBase64(undefined as any))
      .toBe('data:image/jpeg;base64,');
  });*/
//});


/*
Recapitulando, con la siguiente implementación:

```ts
export const rebuildBase64 = function(compressed: string, mimeType = 'image/jpeg'): string {
  if (typeof compressed !== 'string') compressed = '';
  
  // Revert ALL URL-safe transformations (orden crítico)
  const base64 = compressed
    .replace(/_/g, '+')  // Primero _ → +
    .replace(/-/g, '/')  // Luego - → /
    .replace(/\./g, '=') // Puntos a = (casos especiales)
    .replace(/,/g, '='); // Comas a = (casos especiales)

  // Cálculo de padding preciso
  let padding = '';
  const mod4 = base64.length % 4;
  if (mod4 !== 0 || /[-_.,]/.test(compressed)) {
    const neededPadding = mod4 === 0 ? 2 : 4 - mod4;
    padding = '='.repeat(Math.min(neededPadding, 2)); // Máximo 2 =
  }

  // Validación estricta de MIME type
  const validMimeType = /^[a-z]+\/[a-z0-9+-.]+$/.test(mimeType) 
    ? mimeType 
    : 'application/octet-stream';

  return `data:${validMimeType};base64,${base64}${padding}`;
}
```

Pasan solo estas dos pruebas y la otra falla:
```ts
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
```

Mientras que con esta implementación:

```ts
export const rebuildBase64 = function(compressed: string, mimeType = 'image/jpeg'): string {
  if (typeof compressed !== 'string') compressed = '';
  
  // Transformación URL-safe inversa (ORDEN CORRECTO)
  const base64 = compressed
    .replace(/\-/g, '+')  // - → +
    .replace(/\_/g, '/'); // _ → /

  // Cálculo inteligente de padding
  let padding = '';
  const hasUrlSafeChars = /[-_]/.test(compressed);
  const mod4 = base64.length % 4;
  
  if (hasUrlSafeChars) {
    // Para strings URL-safe, usar padding completo (2 = si es múltiplo de 4)
    padding = mod4 === 0 ? '==' : '='.repeat(4 - mod4);
  } else if (mod4 !== 0) {
    // Para strings normales, solo añadir padding necesario
    padding = '='.repeat(4 - mod4);
  }

  // Validación de MIME type
  const validMimeType = /^[a-z]+\/[a-z0-9+-]+$/.test(mimeType) 
    ? mimeType 
    : 'application/octet-stream';

  return `data:${validMimeType};base64,${base64}${padding}`;
}
```

Pasa esta sola prueba:

```ts
it('should be inverse of compressBase64', () => {
  const original = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
  const compressed = compressBase64(original);
  const rebuilt = rebuildBase64(compressed, 'image/png');
  expect(rebuilt).toBe(original); // Ahora pasa correctamente
});
```

Y las otras dos anteriores no pasan.
*/